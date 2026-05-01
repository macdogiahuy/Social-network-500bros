# UML and Data Modeling

## 1. Use Case Diagram

```mermaid
flowchart LR
  guest[Guest] --> register[Register]
  guest --> login[Login]
  user[AuthenticatedUser] --> createPost[CreatePost]
  user --> interactPost[LikeCommentSavePost]
  user --> followUser[FollowUnfollow]
  user --> manageProfile[ManageProfile]
  user --> useChat[SendReceiveMessage]
  user --> readNotifications[ReadNotifications]
  admin[Admin] --> moderateUsers[ManageUsers]
  systemActor[SystemEventProcessor] --> generateNoti[GenerateNotifications]
```

## 2. Class Diagram

```mermaid
classDiagram
  class User {
    +string id
    +string username
    +string email
    +string role
    +login()
    +updateProfile()
  }
  class Post {
    +string id
    +string userId
    +string content
    +create()
    +update()
    +delete()
  }
  class Comment {
    +string id
    +string postId
    +string userId
    +string content
    +addReply()
  }
  class Follow {
    +string followerId
    +string followingId
    +follow()
    +unfollow()
  }
  class Notification {
    +string id
    +string recipientId
    +string action
    +markRead()
  }
  class ChatRoom {
    +string id
    +string type
    +createRoom()
  }
  class ChatMessage {
    +string id
    +string roomId
    +string senderId
    +string content
    +send()
    +react()
  }

  User "1" --> "*" Post : authors
  User "1" --> "*" Comment : writes
  Post "1" --> "*" Comment : contains
  User "*" --> "*" User : Follow
  User "1" --> "*" Notification : receives
  ChatRoom "1" --> "*" ChatMessage : has
```

## 3. Sequence Diagram - Login Flow

```mermaid
sequenceDiagram
  participant UserClient
  participant Frontend
  participant ApiBackend
  participant Database

  UserClient->>Frontend: Submit credentials
  Frontend->>ApiBackend: POST /v1/authenticate
  ApiBackend->>Database: Validate user + password hash
  Database-->>ApiBackend: User record
  ApiBackend-->>Frontend: Access token + profile
  Frontend-->>UserClient: Persist session and redirect
```

## 4. Sequence Diagram - Create Record (Post)

```mermaid
sequenceDiagram
  participant UserClient
  participant Frontend
  participant ApiBackend
  participant Database
  participant EventBus

  UserClient->>Frontend: Create post
  Frontend->>ApiBackend: POST /v1/posts
  ApiBackend->>Database: Insert post
  Database-->>ApiBackend: Created post
  ApiBackend->>EventBus: Publish post_created
  ApiBackend-->>Frontend: Post response
```

## 5. Sequence Diagram - Payment (Future Target)

```mermaid
sequenceDiagram
  participant UserClient
  participant Frontend
  participant ApiBackend
  participant PaymentGateway
  participant WebhookHandler

  UserClient->>Frontend: Confirm subscription
  Frontend->>ApiBackend: POST /v1/payments/checkout
  ApiBackend->>PaymentGateway: Create checkout session
  PaymentGateway-->>Frontend: Redirect URL
  PaymentGateway->>WebhookHandler: payment_succeeded
  WebhookHandler->>ApiBackend: Update subscription status
```

## 6. Sequence Diagram - Notification Flow

```mermaid
sequenceDiagram
  participant ActorUser
  participant ApiBackend
  participant EventBus
  participant NotificationService
  participant SocketServer
  participant RecipientClient

  ActorUser->>ApiBackend: Like or follow action
  ApiBackend->>EventBus: Emit domain event
  EventBus->>NotificationService: Consume event
  NotificationService->>SocketServer: Push realtime notification
  NotificationService->>ApiBackend: Persist notification
  SocketServer-->>RecipientClient: new_notification
```

## 7. Activity Diagram - Content Interaction Workflow

```mermaid
flowchart TD
  startNode[Start] --> authCheck[UserAuthenticated]
  authCheck -->|No| redirectLogin[RedirectToLogin]
  authCheck -->|Yes| openFeed[OpenFeed]
  openFeed --> chooseAction[ChooseAction]
  chooseAction --> createPost[CreatePost]
  chooseAction --> reactPost[LikeOrComment]
  chooseAction --> openChat[OpenChat]
  createPost --> refreshFeed[RefreshFeed]
  reactPost --> refreshFeed
  openChat --> sendMessage[SendMessage]
  sendMessage --> waitRealtime[ReceiveRealtimeUpdates]
  refreshFeed --> endNode[End]
  waitRealtime --> endNode
```

## 8. ERD (Logical)

```mermaid
erDiagram
  USERS ||--o{ POSTS : creates
  USERS ||--o{ COMMENTS : writes
  POSTS ||--o{ COMMENTS : has
  USERS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ FOLLOWS : follows
  USERS ||--o{ CHAT_MESSAGES : sends
  CHAT_ROOMS ||--o{ CHAT_MESSAGES : contains
  TOPICS ||--o{ POSTS : classifies

  USERS {
    string id
    string username
    string email
    string role
  }
  POSTS {
    string id
    string userId
    string topicId
    string content
  }
  COMMENTS {
    string id
    string postId
    string userId
    string parentId
  }
  NOTIFICATIONS {
    string id
    string recipientId
    string actorId
    string action
  }
  CHAT_ROOMS {
    string id
    string type
  }
  CHAT_MESSAGES {
    string id
    string roomId
    string senderId
    string content
  }
```
