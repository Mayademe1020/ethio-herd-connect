
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ThumbsUp, Eye, Clock, Users, BookOpen, HelpCircle } from 'lucide-react';
import { Language } from '@/types';

interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  category: 'health' | 'breeding' | 'feeding' | 'market' | 'general';
  replies: number;
  likes: number;
  views: number;
  createdAt: string;
  isHot: boolean;
  hasExpertReply: boolean;
}

interface CommunityForumPreviewProps {
  language: Language;
}

export const CommunityForumPreview = ({ language }: CommunityForumPreviewProps) => {
  const translations = {
    am: {
      title: 'የአርሶ አደሮች ማህበረሰብ',
      subtitle: 'ከሌሎች አርሶ አደሮች ጋር ተማማሩ እና ተሳተፉ',
      joinForum: 'ወደ ፎረም ግባ',
      viewAll: 'ሁሉንም ይመልከቱ',
      hot: 'ትኩስ',
      expert: 'ባለሙያ',
      replies: 'ምላሾች',
      likes: 'መወደዶች',
      views: 'እይታዎች',
      categories: {
        health: 'ጤንነት',
        breeding: 'እርባታ',
        feeding: 'መመገብ',
        market: 'ገበያ',
        general: 'አጠቃላይ'
      },
      timeAgo: {
        minutes: 'ደቂቃዎች በፊት',
        hours: 'ሰዓቶች በፊት',
        days: 'ቀናት በፊት',
        weeks: 'ሳምንታት በፊት'
      },
      askQuestion: 'ጥያቄ ጠይቅ',
      shareExperience: 'ተሞክሮ ካፍል'
    },
    en: {
      title: 'Farmers Community',
      subtitle: 'Learn and engage with fellow farmers',
      joinForum: 'Join Forum',
      viewAll: 'View All',
      hot: 'Hot',
      expert: 'Expert',
      replies: 'Replies',
      likes: 'Likes',
      views: 'Views',
      categories: {
        health: 'Health',
        breeding: 'Breeding',
        feeding: 'Feeding',
        market: 'Market',
        general: 'General'
      },
      timeAgo: {
        minutes: 'minutes ago',
        hours: 'hours ago',
        days: 'days ago',
        weeks: 'weeks ago'
      },
      askQuestion: 'Ask Question',
      shareExperience: 'Share Experience'
    },
    or: {
      title: 'Hawaasa Qonnaa Bultoota',
      subtitle: 'Qonnaa bultoota biroo waliin baradhu fi hirmaadhu',
      joinForum: 'Foorum Seeni',
      viewAll: 'Hundaa Ilaali',
      hot: 'Ho\'aa',
      expert: 'Ogeessa',
      replies: 'Deebii',
      likes: 'Jaalala',
      views: 'Mul\'annoo',
      categories: {
        health: 'Fayyaa',
        breeding: 'Hormaata',
        feeding: 'Sooruu',
        market: 'Gabaa',
        general: 'Waliigalaa'
      },
      timeAgo: {
        minutes: 'daqiiqaa dura',
        hours: 'sa\'aatii dura',
        days: 'guyyaa dura',
        weeks: 'torban dura'
      },
      askQuestion: 'Gaafii Gaafadhu',
      shareExperience: 'Muuxannoo Qoodu'
    },
    sw: {
      title: 'Jumuiya ya Wakulima',
      subtitle: 'Jifunze na shirikiane na wakulima wenzako',
      joinForum: 'Jiunge na Jukwaa',
      viewAll: 'Ona Zote',
      hot: 'Moto',
      expert: 'Mtaalamu',
      replies: 'Majibu',
      likes: 'Mapendekezo',
      views: 'Miongozo',
      categories: {
        health: 'Afya',
        breeding: 'Uzazi',
        feeding: 'Ulishaji',
        market: 'Soko',
        general: 'Jumla'
      },
      timeAgo: {
        minutes: 'dakika zilizopita',
        hours: 'masaa yaliyopita',
        days: 'siku zilizopita',
        weeks: 'wiki zilizopita'
      },
      askQuestion: 'Uliza Swali',
      shareExperience: 'Shiriki Uzoefu'
    }
  };

  const t = translations[language];

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: language === 'am' 
        ? 'ከብቶች ላይ የFMD በሽታ መከላከል'
        : language === 'or'
        ? 'Ittiifannoo dhukkuba FMD loon irratti'
        : language === 'sw'
        ? 'Kuzuia ugonjwa wa FMD kwa ng\'ombe'
        : 'Preventing FMD in cattle',
      excerpt: language === 'am'
        ? 'የእግር እና አፍ በሽታን ለመከላከል የተሻሉ መንገዶች ምንድናቸው?'
        : 'What are the best ways to prevent foot and mouth disease?',
      author: 'Dr. Alemayehu',
      authorAvatar: 'DA',
      category: 'health',
      replies: 23,
      likes: 45,
      views: 234,
      createdAt: '2 hours ago',
      isHot: true,
      hasExpertReply: true
    },
    {
      id: '2',
      title: language === 'am'
        ? 'የደረቅ ወቅት የከብት መኖ አያያዝ'
        : 'Dry season cattle feed management',
      excerpt: language === 'am'
        ? 'በደረቅ ወቅት ከብቶችን እንዴት መመገብ እንችላለን?'
        : 'How can we properly feed cattle during dry season?',
      author: 'Farmer Bekele',
      authorAvatar: 'FB',
      category: 'feeding',
      replies: 18,
      likes: 32,
      views: 189,
      createdAt: '1 day ago',
      isHot: false,
      hasExpertReply: false
    },
    {
      id: '3',
      title: language === 'am'
        ? 'የሰርንዶዎ የግብርና ገበያ ተሞክሮ'
        : 'Experience with Serodono agricultural market',
      excerpt: language === 'am'
        ? 'ተሞክሮዎን በሰርንዶዎ ገበያ ማዕከል ያጋሩን'
        : 'Share your experience with Serendo market center',
      author: 'Ato Girma',
      authorAvatar: 'AG',
      category: 'market',
      replies: 12,
      likes: 28,
      views: 156,
      createdAt: '3 days ago',
      isHot: false,
      hasExpertReply: true
    }
  ];

  const getCategoryColor = (category: ForumPost['category']) => {
    const colorMap = {
      health: 'bg-red-100 text-red-800',
      breeding: 'bg-purple-100 text-purple-800',
      feeding: 'bg-green-100 text-green-800',
      market: 'bg-blue-100 text-blue-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colorMap[category];
  };

  return (
    <Card className="border-ethiopia-green-200">
      <CardHeader className="bg-gradient-to-r from-ethiopia-green-600 to-ethiopia-green-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg font-semibold">{t.title}</CardTitle>
              <p className="text-sm text-green-100 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {t.joinForum}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button className="bg-ethiopia-green-600 hover:bg-ethiopia-green-700 text-white h-12">
            <HelpCircle className="w-4 h-4 mr-2" />
            {t.askQuestion}
          </Button>
          <Button variant="outline" className="border-ethiopia-green-200 text-ethiopia-green-700 hover:bg-ethiopia-green-50 h-12">
            <BookOpen className="w-4 h-4 mr-2" />
            {t.shareExperience}
          </Button>
        </div>

        {/* Recent Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              {language === 'am' ? 'ቅርብ ጊዜ ጽሁፎች' : 'Recent Posts'}
            </h4>
            <Button variant="ghost" size="sm" className="text-ethiopia-green-600">
              {t.viewAll}
            </Button>
          </div>

          {forumPosts.map((post) => (
            <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-ethiopia-green-100 text-ethiopia-green-700 text-sm font-medium">
                    {post.authorAvatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900 truncate">
                          {post.title}
                        </h5>
                        {post.isHot && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            🔥 {t.hot}
                          </Badge>
                        )}
                        {post.hasExpertReply && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            ✓ {t.expert}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                          {t.categories[post.category]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          by {post.author}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.replies} {t.replies}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{post.likes} {t.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.views} {t.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Stats */}
        <div className="mt-6 p-4 bg-ethiopia-gold-50 rounded-lg border border-ethiopia-gold-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-ethiopia-green-700">1,247</div>
              <div className="text-xs text-gray-600">
                {language === 'am' ? 'አባላት' : 'Members'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ethiopia-green-700">3,456</div>
              <div className="text-xs text-gray-600">
                {language === 'am' ? 'ጽሁፎች' : 'Posts'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ethiopia-green-700">12</div>
              <div className="text-xs text-gray-600">
                {language === 'am' ? 'ባለሙያዎች' : 'Experts'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
