# Implementation Plan

## Phase 1: Core Infrastructure

- [x] 1. Set up database schema for muzzle identification









  - [x] 1.1 Create Supabase migration for muzzle tables

    - Create `muzzle_registrations` table with pgvector extension
    - Create `muzzle_identification_logs` table for audit
    - Create `muzzle_duplicate_events` table
    - Create `ownership_transfers` table
    - Create `muzzle_model_versions` table
    - Add indexes for vector similarity search
    - _Requirements: 2.4, 2.5, 3.3, 7.1_

  - [x] 1.2 Update TypeScript types for muzzle data

    - Add MuzzleRegistration interface
    - Add MuzzleEmbedding interface
    - Add IdentificationResult interface
    - Add OwnershipTransfer interface
    - Update AnimalData to include muzzle status
    - _Requirements: 2.4, 5.1_

  - [x] 1.3 Create Supabase RLS policies for muzzle data

    - Owner can read/write their animal's muzzle data
    - Public can search (but not see raw embeddings)
    - Audit logs are append-only
    - _Requirements: 7.1, 7.3_

- [x] 2. Implement device capability detection






  - [x] 2.1 Create useDeviceCapability hook

    - Detect WebGL availability
    - Estimate device RAM
    - Check GPU tier
    - Detect battery level and low power mode
    - Determine recommended inference mode (local/server)
    - _Requirements: 9.1, 9.2, 9.4_

  - [x] 2.2 Create DeviceCapabilityContext provider

    - Store capability assessment results
    - Provide inference mode toggle
    - Handle capability changes (battery, etc.)
    - _Requirements: 9.3, 9.4_

## Phase 2: Muzzle Capture UI

- [x] 3. Build muzzle capture camera component




  - [x] 3.1 Create MuzzleCaptureCamera component

    - Implement camera access with getUserMedia
    - Add circular guide overlay for muzzle positioning
    - Implement real-time quality indicators
    - Add distance guidance overlay
    - Support burst capture mode (3-5 images)
    - _Requirements: 1.1, 1.2, 1.8, 1.12_

  - [x] 3.2 Create MuzzleQualityValidator component

    - Implement brightness detection
    - Implement blur detection
    - Implement distance estimation
    - Implement motion detection
    - Show real-time quality score

    - _Requirements: 1.4, 1.5, 1.10, 1.11_
  - [x] 3.3 Create MuzzleCapturePreview component

    - Display captured image(s)
    - Show quality assessment results
    - Provide retake/confirm options

    - Auto-select best image from burst
    - _Requirements: 1.7, 1.8, 1.9_
  - [x] 3.4 Create MuzzleCaptureGuide component


    - Show positioning instructions
    - Display lighting tips
    - Show animal welfare guidance
    - Support Amharic and English
    - _Requirements: 1.10, 1.11, 12.1, 14.1_
  - [ ]* 3.5 Write unit tests for capture components
    - Test camera initialization
    - Test quality validation logic
    - Test burst capture selection
    - _Requirements: 1.4, 1.8_

## Phase 3: ML Model Integration

- [ ] 4. Integrate TensorFlow.js for feature extraction




  - [ ] 4.1 Create muzzleMLService
    - Implement model loading with caching
    - Add model initialization with progress callback
    - Implement feature extraction pipeline
    - Add model version tracking
    - Handle WebGL fallback to CPU
    - _Requirements: 2.1, 2.2, 2.7, 6.1_
  - [ ] 4.2 Create useMuzzleFeatureExtractor hook
    - Manage model loading state
    - Provide extraction function
    - Handle extraction errors with retry
    - Track extraction progress
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 4.3 Implement image preprocessing pipeline







    - Resize to model input size
    - Normalize pixel values
    - Apply quality enhancement
    - Handle different image orientations
    - _Requirements: 1.6, 2.1_
  - [ ] 4.4 Create server-side inference fallback
    - Create Supabase Edge Function for inference
    - Implement API client for server inference
    - Add automatic fallback when local fails
    - Handle offline queuing for server inference
    - _Requirements: 9.2, 9.3, 9.6_
  - [ ]* 4.5 Write unit tests for ML service
    - Test model loading
    - Test feature extraction output shape
    - Test fallback behavior
    - _Requirements: 2.1, 9.2_

## Phase 4: Muzzle Registration Flow

- [ ] 5. Build muzzle registration integration









  - [ ] 5.1 Create useMuzzleRegistration hook


    - Manage registration flow state
    - Handle embedding storage
    - Implement duplicate checking
    - Handle consent collection
    - _Requirements: 3.1, 3.2, 3.3, 7.6_
  - [ ] 5.2 Integrate muzzle capture into animal registration
    - Add "Add Muzzle ID" button to registration step 3
    - Launch capture flow from registration
    - Link muzzle data to animal record
    - Show skip option
    - _Requirements: 3.1, 3.2, 3.7, 3.8_
  - [ ] 5.3 Create MuzzleDuplicateAlert component
    - Show duplicate detection warning
    - Provide resolution options (continue, transfer, report, cancel)
    - Require additional verification for override
    - Log duplicate events
    - _Requirements: 3.4, 3.5, 3.6_
  - [ ] 5.4 Create MuzzleRegistrationBadge component
    - Show "Muzzle Verified" badge on animal cards
    - Display registration status on animal detail
    - Show muzzle thumbnail
    - _Requirements: 3.7, 5.1, 5.2_
  - [ ] 5.5 Create MuzzleConsentDialog component
    - Explain biometric data collection
    - Get explicit consent before capture
    - Store consent record
    - Support Amharic and English
    - _Requirements: 7.6, 14.1_
  - [ ]* 5.6 Write integration tests for registration flow
    - Test complete registration with muzzle
    - Test duplicate detection
    - Test skip muzzle option
    - _Requirements: 3.2, 3.4, 3.8_

## Phase 5: Muzzle Identification

- [ ] 6. Build muzzle identification system
  - [ ] 6.1 Create useMuzzleIdentification hook
    - Implement local database search
    - Implement cloud database search
    - Handle confidence thresholds
    - Return match results with alternatives
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ] 6.2 Create vector similarity search function
    - Implement pgvector cosine similarity search
    - Add confidence scoring
    - Return top N matches
    - Support regional filtering
    - _Requirements: 4.2, 4.3, 4.4_
  - [ ] 6.3 Create MuzzleIdentificationResult component
    - Display match result with confidence
    - Show animal details and owner info
    - Handle "possible match" with verification prompt
    - Handle "no match" with registration suggestion
    - _Requirements: 4.3, 4.4, 4.5_
  - [ ] 6.4 Create IdentifyAnimalPage
    - Launch muzzle capture flow
    - Display identification results
    - Log identification attempts
    - Support offline identification
    - _Requirements: 4.1, 4.6, 4.7_
  - [ ] 6.5 Add identification audit logging
    - Log all identification attempts
    - Store search parameters and results
    - Track device and location info
    - _Requirements: 4.6, 7.4_
  - [ ]* 6.6 Write integration tests for identification
    - Test successful identification
    - Test possible match handling
    - Test no match handling
    - Test offline identification
    - _Requirements: 4.3, 4.4, 4.5, 4.7_

## Phase 6: Offline Support

- [ ] 7. Implement offline muzzle functionality
  - [ ] 7.1 Create IndexedDB schema for muzzle data
    - Store ML model for offline use
    - Cache local muzzle embeddings
    - Store pending operations queue
    - Store capture history
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 7.2 Create muzzleSyncService
    - Sync pending registrations when online
    - Sync pending identifications
    - Handle sync conflicts
    - Prioritize recent captures
    - _Requirements: 6.4, 6.5, 6.6, 6.7_
  - [ ] 7.3 Update service worker for muzzle data
    - Cache ML model files
    - Handle offline API requests
    - Queue operations for later sync
    - _Requirements: 6.1, 6.4_
  - [ ] 7.4 Create SyncStatusIndicator for muzzle operations
    - Show pending sync count
    - Display sync progress
    - Handle sync errors
    - _Requirements: 6.4, 6.5_
  - [ ]* 7.5 Write offline tests
    - Test offline registration
    - Test offline identification
    - Test sync when online
    - _Requirements: 6.3, 6.4, 6.5_

## Phase 7: Muzzle Data Management

- [ ] 8. Build muzzle data management features
  - [ ] 8.1 Create MuzzleManagementSection component
    - Display muzzle registration status
    - Show muzzle thumbnail
    - Provide View, Update, Remove options
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 8.2 Create UpdateMuzzleFlow
    - Capture new muzzle image
    - Replace old embedding
    - Log change with reason
    - _Requirements: 5.4, 5.6_
  - [ ] 8.3 Create RemoveMuzzleDialog
    - Require confirmation
    - Log deletion with reason
    - Update animal record
    - _Requirements: 5.5, 5.6_
  - [ ]* 8.4 Write tests for muzzle management
    - Test view muzzle data
    - Test update muzzle
    - Test remove muzzle
    - _Requirements: 5.3, 5.4, 5.5_

## Phase 8: Ownership Transfer

- [ ] 9. Implement ownership transfer with muzzle verification
  - [ ] 9.1 Create useOwnershipTransfer hook
    - Initiate transfer request
    - Handle confirmation flow
    - Manage verification status
    - Handle disputes
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ] 9.2 Create TransferInitiationFlow
    - Select animal to transfer
    - Enter recipient details
    - Require PIN/OTP confirmation
    - Create pending transfer record
    - _Requirements: 10.1, 10.4_
  - [ ] 9.3 Create TransferVerificationFlow
    - Buyer scans muzzle to verify
    - Compare with registered muzzle
    - Show verification result
    - Complete or dispute transfer
    - _Requirements: 10.2, 10.6_
  - [ ] 9.4 Create TransferStatusCard component
    - Show transfer status to both parties
    - Display verification status
    - Provide action buttons
    - _Requirements: 10.4, 10.5_
  - [ ] 9.5 Create DisputeTransferDialog
    - Allow dispute filing
    - Require reason
    - Flag animal record
    - Notify both parties
    - _Requirements: 10.3_
  - [ ]* 9.6 Write integration tests for transfers
    - Test complete transfer flow
    - Test muzzle verification
    - Test dispute handling
    - _Requirements: 10.1, 10.2, 10.3_

## Phase 9: Edge Cases and Animal Welfare

- [ ] 10. Implement edge case handling
  - [ ] 10.1 Create edge case detection in quality validator
    - Detect injured/scarred muzzles
    - Detect young animal (calf) muzzles
    - Detect partial muzzle captures
    - Detect similar patterns (twins)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [ ] 10.2 Create EdgeCaseHandler component
    - Show appropriate guidance for each case
    - Request additional photos when needed
    - Offer alternative verification methods
    - _Requirements: 11.1, 11.5_
  - [ ] 10.3 Create FallbackIdentificationOptions component
    - Offer ear tag recognition
    - Offer photo comparison
    - Offer owner verification
    - _Requirements: 11.5_
  - [ ] 10.4 Create AnimalWelfareGuidance component
    - Show calming tips during capture
    - Suggest breaks when needed
    - Display gentle handling techniques
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 10.5 Write tests for edge case handling
    - Test injured muzzle detection
    - Test young animal handling
    - Test fallback methods
    - _Requirements: 11.1, 11.2, 11.5_

## Phase 10: User Training and Onboarding

- [ ] 11. Build user training system
  - [ ] 11.1 Create MuzzleTutorial component
    - Interactive step-by-step guide
    - Video demonstrations
    - Practice mode with sample images
    - Progress tracking
    - _Requirements: 13.1, 13.3, 13.5_
  - [ ] 11.2 Create CaptureQualityExamples component
    - Show good vs bad capture examples
    - Explain what makes a good capture
    - Provide visual comparison
    - _Requirements: 13.2_
  - [ ] 11.3 Create ContextualHelpSystem
    - Show tips based on current step
    - Provide troubleshooting guidance
    - Offer voice guidance option
    - _Requirements: 13.4, 13.6_
  - [ ] 11.4 Add Amharic translations for muzzle feature
    - Translate all UI text
    - Translate error messages
    - Translate tutorial content
    - Add voice guidance in Amharic
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - [ ]* 11.5 Write tests for tutorial flow
    - Test tutorial completion
    - Test practice mode
    - Test language switching
    - _Requirements: 13.1, 14.1_

## Phase 11: Performance and Security

- [ ] 12. Optimize performance and security
  - [ ] 12.1 Implement model optimization
    - Apply INT8 quantization
    - Implement lazy loading
    - Add memory management
    - Optimize for low-end devices
    - _Requirements: 8.1, 8.2, 9.5_
  - [ ] 12.2 Implement security measures
    - Encrypt embeddings in IndexedDB
    - Implement secure API calls
    - Add rate limiting for identification
    - Log security events
    - _Requirements: 7.1, 7.2, 7.4_
  - [ ] 12.3 Add performance monitoring
    - Track model load time
    - Track extraction time
    - Track search latency
    - Report metrics to analytics
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ] 12.4 Implement data retention policies
    - Auto-delete old identification logs
    - Archive inactive muzzle data
    - Handle user data deletion requests
    - _Requirements: 7.5, 7.8_
  - [ ]* 12.5 Write performance tests
    - Test model load time
    - Test extraction time
    - Test search latency
    - _Requirements: 8.1, 8.2, 8.3_

## Phase 12: Final Integration and Testing

- [ ] 13. Complete integration and testing
  - [ ] 13.1 Integrate muzzle features into main app navigation
    - Add "Identify Animal" to home screen
    - Add muzzle section to animal detail page
    - Add transfer option to marketplace
    - _Requirements: 4.1, 5.1, 10.6_
  - [ ] 13.2 Create comprehensive E2E tests
    - Test complete registration flow
    - Test complete identification flow
    - Test ownership transfer flow
    - Test offline scenarios
    - _Requirements: All_
  - [ ] 13.3 Conduct accessibility audit
    - Test with screen readers
    - Test high contrast mode
    - Test large text mode
    - Test voice commands
    - _Requirements: Accessibility_
  - [ ] 13.4 Create user documentation
    - Write help articles
    - Create FAQ section
    - Add troubleshooting guide
    - _Requirements: 13.6_
  - [ ]* 13.5 Write final integration tests
    - Test all features together
    - Test error recovery
    - Test edge cases
    - _Requirements: All_

