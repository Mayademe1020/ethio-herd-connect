# Enhanced Marketplace - Technical Design Document

## Overview

This design document outlines the technical architecture for transforming the marketplace into a comprehensive trading platform with chat, verification, health certification, and ratings.

**Key Components:**
1. Real-time Chat System (Supabase Realtime)
2. Telegram Bot Integration
3. Multi-level Verification System
4. Health Certification Display
5. Transaction & Rating System
6. Q&A System
7. Notification Engine

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  Chat UI  │  Telegram  │  Verification  │  Ratings      │
│  Q&A UI   │  Health    │  Notifications │  Analytics    │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              Supabase Backend                            │
├─────────────────────────────────────────────────────────┤
│  Realtime  │  Database  │  Storage  │  Auth  │  Edge    │
│  Functions │  RLS       │  Buckets  │  JWT   │  Functions│
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
├─────────────────────────────────────────────────────────┤
│  Telegram Bot API  │  SMS Gateway  │  ID Verification   │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 1: In-App Chat System

### Database Schema

```sql
-- Chat conversations
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES public_market_listings(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  status text DEFAULT 'active', -- active, archived, blocked
  last_message_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Chat messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  message_type text DEFAULT 'text', -- text, image, voice, system
  content text,
  media_url text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_chat_conversations_buyer ON chat_conversations(buyer_id);
CREATE INDEX idx_chat_conversations_seller ON chat_conversations(seller_id);
CREATE INDEX idx_chat_conversations_listing ON chat_conversations(listing_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can only see messages in their conversations
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );
```

### React Components

```typescript
// src/components/ChatInterface.tsx
export const ChatInterface = ({ conversationId, listing }) => {
  const { messages, sendMessage, loading } = useChat(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to real-time messages
  useEffect(() => {
    const subscription = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Add new message to state
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [conversationId]);
  
  return (
    <div className="chat-container">
      <ChatHeader listing={listing} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

// src/hooks/useChat.tsx
export const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
  
  const sendMessage = async (content: string, type = 'text') => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: type,
        content
      });
    
    if (error) throw error;
  };
  
  return { messages: data || [], sendMessage, loading: isLoading };
};
```

---

## Feature 2: Telegram Integration

### Database Schema

```sql
-- Telegram connections
CREATE TABLE telegram_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) UNIQUE NOT NULL,
  telegram_username text NOT NULL,
  telegram_chat_id text,
  is_verified boolean DEFAULT false,
  verification_code text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- RLS Policy
ALTER TABLE telegram_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own telegram" ON telegram_connections
  FOR ALL USING (auth.uid() = user_id);
```

### Telegram Bot Setup

```typescript
// src/utils/telegramBot.ts
export const TELEGRAM_BOT_USERNAME = 'EthioHerdBot';
export const TELEGRAM_BOT_LINK = 'https://t.me/EthioHerdBot';

export const generateTelegramDeepLink = (
  sellerUsername: string,
  listingId: string,
  listingTitle: string
) => {
  const message = encodeURIComponent(
    `Hi! I'm interested in your listing: ${listingTitle}\n` +
    `Listing ID: ${listingId}\n` +
    `From: EthioHerd Connect`
  );
  
  return `https://t.me/${sellerUsername}?text=${message}`;
};

// Telegram verification flow
export const initiateTelegramVerification = async (userId: string) => {
  const verificationCode = generateVerificationCode();
  
  await supabase
    .from('telegram_connections')
    .upsert({
      user_id: userId,
      verification_code: verificationCode
    });
  
  return verificationCode;
};
```

### React Components

```typescript
// src/components/TelegramConnect.tsx
export const TelegramConnect = () => {
  const { user } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleConnect = async () => {
    const code = await initiateTelegramVerification(user.id);
    setVerificationCode(code);
    
    // Open Telegram bot
    window.open(
      `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${code}`,
      '_blank'
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Telegram</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Connect your Telegram to receive messages and continue conversations.</p>
        <Button onClick={handleConnect}>
          Connect Telegram
        </Button>
        {verificationCode && (
          <p>Verification Code: <code>{verificationCode}</code></p>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## Feature 3: Seller Verification System

### Database Schema

```sql
-- Seller verification
CREATE TABLE seller_verification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) UNIQUE NOT NULL,
  verification_level text DEFAULT 'basic', -- basic, verified, trusted, premium
  phone_verified boolean DEFAULT false,
  phone_verified_at timestamp,
  id_document_url text,
  id_verified boolean DEFAULT false,
  id_verified_at timestamp,
  id_verified_by uuid REFERENCES profiles(id),
  in_person_verified boolean DEFAULT false,
  in_person_verified_at timestamp,
  in_person_verified_by uuid REFERENCES profiles(id),
  verification_notes text,
  successful_transactions integer DEFAULT 0,
  average_rating numeric(3,2),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Verification documents storage
CREATE TABLE verification_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  document_type text NOT NULL, -- id_card, passport, drivers_license
  document_url text NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamp,
  rejection_reason text,
  created_at timestamp DEFAULT now()
);

-- RLS Policies
ALTER TABLE seller_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification" ON seller_verification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public verification" ON seller_verification
  FOR SELECT USING (true); -- Public for trust

CREATE POLICY "Users can manage own documents" ON verification_documents
  FOR ALL USING (auth.uid() = user_id);
```

### Verification Logic

```typescript
// src/hooks/useSellerVerification.tsx
export const useSellerVerification = () => {
  const { user } = useAuth();
  
  const uploadIDDocument = async (file: File, documentType: string) => {
    // Upload to Supabase Storage
    const fileName = `${user.id}/${documentType}_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Create document record
    const { error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        document_url: uploadData.path,
        status: 'pending'
      });
    
    if (error) throw error;
  };
  
  const calculateVerificationLevel = (verification: any) => {
    if (verification.in_person_verified) {
      // Check for Premium
      if (verification.successful_transactions >= 10 && 
          verification.average_rating >= 4.5) {
        return 'premium';
      }
      return 'trusted';
    }
    
    if (verification.id_verified) {
      return 'verified';
    }
    
    if (verification.phone_verified) {
      return 'basic';
    }
    
    return 'none';
  };
  
  return { uploadIDDocument, calculateVerificationLevel };
};
```

### Verification Badge Component

```typescript
// src/components/VerificationBadge.tsx
export const VerificationBadge = ({ level }: { level: string }) => {
  const badges = {
    basic: {
      icon: <Phone className="w-4 h-4" />,
      label: 'Phone Verified',
      color: 'bg-blue-100 text-blue-800'
    },
    verified: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'ID Verified',
      color: 'bg-green-100 text-green-800'
    },
    trusted: {
      icon: <Shield className="w-4 h-4" />,
      label: 'Trusted Seller',
      color: 'bg-purple-100 text-purple-800'
    },
    premium: {
      icon: <Star className="w-4 h-4" />,
      label: 'Premium Seller',
      color: 'bg-yellow-100 text-yellow-800'
    }
  };
  
  const badge = badges[level] || badges.basic;
  
  return (
    <Badge className={badge.color}>
      {badge.icon}
      <span className="ml-1">{badge.label}</span>
    </Badge>
  );
};
```

---

## Feature 4: Animal Health Certification

### Database Schema

```sql
-- Health certifications for listings
CREATE TABLE listing_health_certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES public_market_listings(id) ON DELETE CASCADE,
  animal_id uuid REFERENCES animals(id),
  vaccination_records jsonb, -- Array of vaccination records
  last_health_check_date date,
  health_status text, -- excellent, good, fair, needs_attention
  vet_verified boolean DEFAULT false,
  vet_id uuid REFERENCES profiles(id),
  vet_verification_date timestamp,
  health_guarantee_offered boolean DEFAULT false,
  guarantee_terms text,
  health_issues_disclosed text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- RLS Policy
ALTER TABLE listing_health_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view health certs" ON listing_health_certifications
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own certs" ON listing_health_certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public_market_listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );
```

### Health Display Component

```typescript
// src/components/HealthCertificationDisplay.tsx
export const HealthCertificationDisplay = ({ listingId }) => {
  const { data: healthCert } = useQuery({
    queryKey: ['health-cert', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_health_certifications')
        .select('*')
        .eq('listing_id', listingId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  if (!healthCert) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          No health information provided for this animal
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Information</CardTitle>
        {healthCert.vet_verified && (
          <Badge variant="success">
            <CheckCircle className="w-4 h-4 mr-1" />
            Vet Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Health Status</h4>
            <HealthStatusIndicator status={healthCert.health_status} />
          </div>
          
          <div>
            <h4 className="font-semibold">Vaccination Records</h4>
            <VaccinationList records={healthCert.vaccination_records} />
          </div>
          
          {healthCert.health_guarantee_offered && (
            <div>
              <h4 className="font-semibold">Health Guarantee</h4>
              <p>{healthCert.guarantee_terms}</p>
            </div>
          )}
          
          {healthCert.health_issues_disclosed && (
            <Alert>
              <AlertDescription>
                {healthCert.health_issues_disclosed}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Feature 5: Transaction History & Ratings

### Database Schema

```sql
-- Transactions
CREATE TABLE marketplace_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES public_market_listings(id),
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  animal_id uuid REFERENCES animals(id),
  sale_price numeric NOT NULL,
  transaction_date timestamp DEFAULT now(),
  status text DEFAULT 'completed', -- completed, disputed, cancelled
  payment_method text,
  notes text,
  created_at timestamp DEFAULT now()
);

-- Ratings and reviews
CREATE TABLE seller_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES marketplace_transactions(id) UNIQUE,
  seller_id uuid REFERENCES profiles(id) NOT NULL,
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  response_text text, -- Seller can respond
  is_verified_purchase boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_seller ON marketplace_transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX idx_ratings_seller ON seller_ratings(seller_id);

-- RLS Policies
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON marketplace_transactions
  FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Anyone can view ratings" ON seller_ratings
  FOR SELECT USING (true);

CREATE POLICY "Buyers can rate purchases" ON seller_ratings
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);
```

### Rating System Component

```typescript
// src/components/SellerRatingDisplay.tsx
export const SellerRatingDisplay = ({ sellerId }) => {
  const { data: stats } = useQuery({
    queryKey: ['seller-stats', sellerId],
    queryFn: async () => {
      // Get transaction count
      const { count: transactionCount } = await supabase
        .from('marketplace_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .eq('status', 'completed');
      
      // Get average rating
      const { data: ratings } = await supabase
        .from('seller_ratings')
        .select('rating')
        .eq('seller_id', sellerId);
      
      const avgRating = ratings?.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
      
      return {
        transactionCount,
        averageRating: avgRating.toFixed(1),
        ratingCount: ratings?.length || 0
      };
    }
  });
  
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <span className="ml-1 font-bold">{stats?.averageRating}</span>
        <span className="ml-1 text-gray-600">({stats?.ratingCount} reviews)</span>
      </div>
      <div className="text-sm text-gray-600">
        {stats?.transactionCount} successful sales
      </div>
    </div>
  );
};

// src/components/RatingForm.tsx
export const RatingForm = ({ transactionId, sellerId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const handleSubmit = async () => {
    await supabase
      .from('seller_ratings')
      .insert({
        transaction_id: transactionId,
        seller_id: sellerId,
        buyer_id: user.id,
        rating,
        review_text: review
      });
    
    onSubmit();
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label>Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label>Review (optional)</label>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience..."
        />
      </div>
      <Button onClick={handleSubmit}>Submit Rating</Button>
    </div>
  );
};
```

---

## Feature 6: Q&A System

### Database Schema

```sql
-- Questions and answers
CREATE TABLE listing_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES public_market_listings(id) ON DELETE CASCADE,
  asker_id uuid REFERENCES profiles(id) NOT NULL,
  question_text text NOT NULL,
  answer_text text,
  answered_at timestamp,
  is_public boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- RLS Policy
ALTER TABLE listing_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public questions" ON listing_questions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can ask questions" ON listing_questions
  FOR INSERT WITH CHECK (auth.uid() = asker_id);

CREATE POLICY "Sellers can answer questions" ON listing_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public_market_listings
      WHERE id = listing_id AND user_id = auth.uid()
    )
  );
```

### Q&A Component

```typescript
// src/components/ListingQA.tsx
export const ListingQA = ({ listingId, sellerId }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  
  const { data: questions } = useQuery({
    queryKey: ['listing-qa', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listing_questions')
        .select(`
          *,
          asker:profiles!asker_id(full_name)
        `)
        .eq('listing_id', listingId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  const askQuestion = async () => {
    await supabase
      .from('listing_questions')
      .insert({
        listing_id: listingId,
        asker_id: user.id,
        question_text: question
      });
    
    setQuestion('');
    refetch();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions & Answers</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Ask Question Form */}
        <div className="mb-6">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this listing..."
          />
          <Button onClick={askQuestion} className="mt-2">
            Ask Question
          </Button>
        </div>
        
        {/* Questions List */}
        <div className="space-y-4">
          {questions?.map(q => (
            <div key={q.id} className="border-b pb-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{q.question_text}</p>
                  <p className="text-sm text-gray-600">
                    Asked by {q.asker.full_name}
                  </p>
                  
                  {q.answer_text && (
                    <div className="mt-2 pl-4 border-l-2 border-green-500">
                      <p className="text-green-800">{q.answer_text}</p>
                      <p className="text-sm text-gray-600">
                        Answered {formatDate(q.answered_at)}
                      </p>
                    </div>
                  )}
                  
                  {!q.answer_text && user?.id === sellerId && (
                    <AnswerForm questionId={q.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Feature 7: Notification System

### Database Schema

```sql
-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL, -- message, question, rating, verification, transaction
  title text NOT NULL,
  message text NOT NULL,
  link_url text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id),
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  telegram_notifications boolean DEFAULT false,
  message_notifications boolean DEFAULT true,
  question_notifications boolean DEFAULT true,
  rating_notifications boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
```

### Notification Hook

```typescript
// src/hooks/useNotifications.tsx
export const useNotifications = () => {
  const { user } = useAuth();
  
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Subscribe to real-time notifications
  useEffect(() => {
    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Show toast notification
        toast.info(payload.new.title, {
          description: payload.new.message
        });
        refetch();
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [user.id]);
  
  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    refetch();
  };
  
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  return { notifications, unreadCount, markAsRead };
};
```

---

## Testing Strategy

### Unit Tests
- Test chat message sending/receiving
- Test verification level calculation
- Test rating calculations
- Test notification delivery

### Integration Tests
- Test complete chat flow
- Test Telegram integration
- Test verification workflow
- Test transaction and rating flow

### Manual Testing
- Test on mobile devices
- Test real-time updates
- Test offline mode
- Test with multiple users

---

## Success Metrics

- Chat message delivery < 1 second
- 99.9% uptime for chat system
- Zero data breaches
- 80% user adoption of chat
- 60% seller verification rate
- 70% transaction rating rate

