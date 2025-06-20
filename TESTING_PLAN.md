# TerraShaperPro Self-Testing Plan

## Overview
Comprehensive testing plan to validate all functionality before beta user recruitment. This plan covers end-to-end workflows, edge cases, and performance testing.

## Testing Environment Setup

### Prerequisites
1. **Local Development Server**
   ```bash
   npm run dev
   ```

2. **Test Data Preparation**
   - Create test organizations
   - Prepare sample project data
   - Have test payment methods ready (Stripe test mode)
   - Prepare test images for uploads

3. **Browser Testing**
   - Primary: Chrome (latest)
   - Secondary: Safari, Firefox, Edge
   - Mobile: iOS Safari, Android Chrome

---

## Phase 1: Authentication & User Management (Day 1)

### 1.1 User Registration & Sign-in
- [ ] **Sign up new user**
  - Test with valid email
  - Test with invalid email formats
  - Test password requirements
  - Verify email verification flow

- [ ] **Sign in existing user**
  - Test with correct credentials
  - Test with wrong password
  - Test with non-existent email
  - Test "Forgot Password" flow

- [ ] **Organization Setup**
  - Create new organization
  - Test organization name validation
  - Verify redirect to dashboard after setup

### 1.2 Profile Management
- [ ] **User Profile**
  - Update user name
  - Change email address
  - Update password
  - Test profile image upload (if implemented)

- [ ] **Organization Settings**
  - Update organization name
  - Test organization branding settings
  - Verify settings persistence

---

## Phase 2: Dashboard & Navigation (Day 1)

### 2.1 Dashboard Functionality
- [ ] **Dashboard Loading**
  - Test initial dashboard load
  - Verify all widgets display correctly
  - Test responsive design on mobile

- [ ] **Navigation**
  - Test all menu items
  - Verify active states
  - Test mobile hamburger menu
  - Test organization switcher

### 2.2 Onboarding System
- [ ] **Initial Setup Flow**
  - Complete full onboarding tutorial
  - Test skip functionality
  - Verify progress tracking
  - Test onboarding restart

- [ ] **Help Center**
  - Open help center
  - Test all tutorial tabs
  - Verify sample projects load
  - Test keyboard shortcuts reference

---

## Phase 3: Project Management (Day 2)

### 3.1 Project CRUD Operations
- [ ] **Create Project**
  - Create new blank project
  - Create from sample template
  - Test project name validation
  - Verify project appears in dashboard

- [ ] **Project List**
  - View all projects
  - Test search functionality
  - Test filter options
  - Test sorting (date, name, status)

- [ ] **Project Details**
  - Open existing project
  - Test project metadata editing
  - Verify project statistics

### 3.2 Project Versioning
- [ ] **Version Creation**
  - Make changes to design
  - Verify auto-save functionality
  - Create manual save points
  - Test version comments

- [ ] **Version History**
  - View version history
  - Compare versions (if implemented)
  - Restore previous version
  - Test version deletion

---

## Phase 4: Design Canvas Core (Day 3)

### 4.1 Canvas Initialization
- [ ] **Canvas Loading**
  - Open design page
  - Verify canvas renders properly
  - Test canvas responsiveness
  - Check grid display

- [ ] **Tool Selection**
  - Test select tool (S)
  - Test polygon tool (P)
  - Test area tool (A)
  - Test line tool (L)
  - Verify keyboard shortcuts work

### 4.2 Drawing Operations
- [ ] **Polygon Creation**
  - Draw simple polygon
  - Draw complex shape with many points
  - Test double-click to finish
  - Test escape to cancel

- [ ] **Line Drawing**
  - Draw straight lines
  - Draw curved polylines
  - Test line thickness options
  - Test line colors

- [ ] **Area Creation**
  - Draw garden bed areas
  - Apply different materials (grass, mulch, gravel, etc.)
  - Test material picker UI
  - Verify area calculations

### 4.3 Object Manipulation
- [ ] **Selection**
  - Single object selection
  - Multi-select with Ctrl/Cmd
  - Select all (Ctrl/Cmd + A)
  - Test selection rectangle

- [ ] **Move & Transform**
  - Drag objects to new positions
  - Resize objects with handles
  - Rotate objects
  - Test snap-to-grid functionality

- [ ] **Copy & Paste**
  - Copy single object (Ctrl/Cmd + C)
  - Paste object (Ctrl/Cmd + V)
  - Cut object (Ctrl/Cmd + X)
  - Test paste at cursor location

- [ ] **Group Operations**
  - Group multiple objects (Ctrl/Cmd + G)
  - Ungroup objects (Ctrl/Cmd + U)
  - Test group selection
  - Test group transformation

---

## Phase 5: Plant Library & Assets (Day 4)

### 5.1 Plant Library Access
- [ ] **Library Opening**
  - Open plant library
  - Verify all plants load
  - Test plant image display
  - Check plant information completeness

- [ ] **Search & Filter**
  - Search by plant name
  - Filter by plant type
  - Filter by sun requirements
  - Filter by USDA zone
  - Filter by water needs

### 5.2 Plant Usage
- [ ] **Drag & Drop**
  - Drag plant from library to canvas
  - Test drag feedback
  - Verify plant placement accuracy
  - Test multiple plant placement

- [ ] **Plant Properties**
  - Select placed plant
  - View plant information
  - Edit plant scale/size
  - Test plant deletion

### 5.3 Favorites System
- [ ] **Add to Favorites**
  - Mark plants as favorites
  - Verify favorite indicator
  - Test favorites filter

- [ ] **Manage Favorites**
  - Remove from favorites
  - Verify favorites persistence
  - Test favorites in new projects

---

## Phase 6: Advanced Features (Day 5)

### 6.1 Layer Management
- [ ] **Layer Creation**
  - Create new layers
  - Name layers appropriately
  - Test layer color coding

- [ ] **Layer Operations**
  - Move objects between layers
  - Show/hide layers
  - Lock/unlock layers
  - Change layer order

### 6.2 Measurement Tools
- [ ] **Scale Setting**
  - Set project scale
  - Test different scale units
  - Verify scale persistence

- [ ] **Measurements**
  - Measure distances
  - Measure areas
  - Test measurement display
  - Verify measurement accuracy

### 6.3 Property Panels
- [ ] **Object Properties**
  - Edit object colors
  - Adjust opacity
  - Modify stroke width
  - Test property synchronization

---

## Phase 7: Export & Sharing (Day 6)

### 7.1 Export Functionality
- [ ] **Export Formats**
  - Export as PNG
  - Export as JPG
  - Export as SVG
  - Export as PDF

- [ ] **Export Options**
  - Test different resolutions
  - Test export quality settings
  - Test background options
  - Verify file download

### 7.2 Project Sharing
- [ ] **Share Links**
  - Generate share link
  - Test link accessibility
  - Verify read-only access
  - Test link expiration (if implemented)

---

## Phase 8: Team Collaboration (Day 7)

### 8.1 Team Management
- [ ] **Invite Members**
  - Send team invitations
  - Test email invitation flow
  - Verify invitation acceptance

- [ ] **Role Management**
  - Assign different roles
  - Test permission restrictions
  - Verify role-based access

### 8.2 Collaboration Features
- [ ] **Project Access**
  - Share project with team
  - Test concurrent editing (if implemented)
  - Verify activity logs

- [ ] **Comments System**
  - Add comments to designs
  - Reply to comments
  - Resolve comments
  - Test comment notifications

---

## Phase 9: AI Rendering & Credits (Day 8)

### 9.1 Credit System
- [ ] **Credit Display**
  - Verify current credit balance
  - Test credit consumption tracking
  - Check credit purchase flow

### 9.2 AI Rendering
- [ ] **Render Request**
  - Start AI render of design
  - Monitor render progress
  - Test queue position display

- [ ] **Render Results**
  - View completed renders
  - Download render images
  - Test render quality feedback
  - Verify credit deduction

### 9.3 Error Handling
- [ ] **Render Failures**
  - Test failed render handling
  - Verify credit refund
  - Test retry functionality

---

## Phase 10: Billing & Subscriptions (Day 9)

### 10.1 Subscription Management
- [ ] **Plan Selection**
  - View available plans
  - Test plan comparison
  - Verify feature limitations

- [ ] **Subscription Flow**
  - Upgrade to paid plan
  - Test Stripe payment flow
  - Verify subscription activation

### 10.2 Billing Dashboard
- [ ] **Payment History**
  - View past invoices
  - Download invoice PDFs
  - Check payment methods

- [ ] **Usage Tracking**
  - View current usage
  - Monitor render consumption
  - Check storage usage

---

## Phase 11: Performance Testing (Day 10)

### 11.1 Load Testing
- [ ] **Large Projects**
  - Create project with 100+ objects
  - Test canvas performance
  - Monitor memory usage

- [ ] **Plant Library Performance**
  - Load all 400+ plants
  - Test search responsiveness
  - Check image loading speed

### 11.2 Browser Compatibility
- [ ] **Cross-Browser Testing**
  - Test in Chrome, Safari, Firefox, Edge
  - Verify feature parity
  - Check performance differences

- [ ] **Mobile Testing**
  - Test responsive design
  - Check touch interactions
  - Verify mobile performance

---

## Phase 12: Error Scenarios (Day 11)

### 12.1 Network Issues
- [ ] **Offline Behavior**
  - Test with network disconnected
  - Verify error messages
  - Test reconnection handling

- [ ] **Slow Network**
  - Test with throttled connection
  - Verify loading states
  - Check timeout handling

### 12.2 Data Edge Cases
- [ ] **Empty States**
  - Test with no projects
  - Test with no team members
  - Verify empty state displays

- [ ] **Large Data Sets**
  - Test with many projects
  - Test with large design files
  - Monitor performance impact

---

## Phase 13: Security Testing (Day 12)

### 13.1 Authentication Security
- [ ] **Session Management**
  - Test session expiration
  - Verify logout functionality
  - Test cross-tab session sync

- [ ] **Access Control**
  - Test unauthorized access attempts
  - Verify role-based restrictions
  - Test organization isolation

### 13.2 Data Security
- [ ] **Input Validation**
  - Test XSS prevention
  - Test injection attacks
  - Verify data sanitization

---

## Daily Testing Schedule

### Week 1: Core Functionality
- **Day 1**: Auth & Dashboard (Phases 1-2)
- **Day 2**: Project Management (Phase 3)
- **Day 3**: Design Canvas (Phase 4)
- **Day 4**: Plant Library (Phase 5)
- **Day 5**: Advanced Features (Phase 6)
- **Day 6**: Export & Sharing (Phase 7)
- **Day 7**: Team Features (Phase 8)

### Week 2: Advanced & Edge Cases
- **Day 8**: AI Rendering (Phase 9)
- **Day 9**: Billing (Phase 10)
- **Day 10**: Performance (Phase 11)
- **Day 11**: Error Scenarios (Phase 12)
- **Day 12**: Security (Phase 13)

## Bug Tracking

### Bug Report Template
```markdown
**Bug Title**: [Short description]
**Priority**: Critical/High/Medium/Low
**Browser**: [Chrome/Safari/Firefox/Edge]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 
**Actual Result**: 
**Screenshots**: [If applicable]
**Console Errors**: [If any]
```

### Priority Levels
- **Critical**: App crashes, data loss, security issues
- **High**: Major features broken, user flow blocked
- **Medium**: Minor features broken, UI issues
- **Low**: Cosmetic issues, nice-to-have improvements

## Completion Criteria

### Ready for Beta When:
- [ ] All critical and high priority bugs fixed
- [ ] Core user workflows function smoothly
- [ ] Performance meets acceptable standards
- [ ] Cross-browser compatibility confirmed
- [ ] Security vulnerabilities addressed
- [ ] Error handling provides clear user feedback
- [ ] Onboarding flow guides users effectively

### Success Metrics
- **Bug Density**: < 5 medium/low bugs per major feature
- **Performance**: Page load < 3s, canvas interactions < 100ms
- **Uptime**: No crashes during 8+ hour testing sessions
- **Usability**: Can complete full design workflow without confusion

---

**Note**: Keep detailed notes of all issues found and track resolution progress. This testing data will be valuable for prioritizing fixes and improving the beta user experience.