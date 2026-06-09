# Mernix

Fullstack MERN app for online video watching platform.
[Visit Here!](https://mernix.vercel.app)

## File/Folder Structure

```bash
.
├── client
│   ├── bun.lock
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── README.md
│   ├── src
│   │   ├── api
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── video.service.ts
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components
│   │   │   ├── auth
│   │   │   │   └── LoginModal.tsx
│   │   │   ├── common
│   │   │   │   └── ConfirmationModal.tsx
│   │   │   ├── container
│   │   │   │   └── Container.tsx
│   │   │   ├── layout
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── layouts
│   │   │       ├── AuthLayout.tsx
│   │   │       ├── DashboardLayout.tsx
│   │   │       └── index.ts
│   │   ├── conf
│   │   │   └── conf.ts
│   │   ├── hooks
│   │   │   ├── useChangePassword.ts
│   │   │   ├── useChannelProfile.ts
│   │   │   ├── useGetVideos.ts
│   │   │   ├── useLogin.ts
│   │   │   ├── useLogout.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useUpdateSettings.ts
│   │   │   ├── useVideoDetails.ts
│   │   │   ├── useVideoMutations.ts
│   │   │   └── useWatchHistory.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── Channel.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── index.ts
│   │   │   ├── Login.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── WatchHistory.tsx
│   │   ├── providers
│   │   │   └── AuthProvider.tsx
│   │   ├── store
│   │   │   ├── authStore.ts
│   │   │   └── themeStore.ts
│   │   ├── types
│   │   │   └── types.ts
│   │   └── utils
│   │       ├── cn.ts
│   │       └── formatDuration.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── Postman Collections
│   └── API_Docs.md.json
├── README.md
└── server
    ├── mernix.postman_collection.json
    ├── package.json
    ├── pnpm-lock.yaml
    ├── public
    │   └── temp
    ├── README.md
    ├── src
    │   ├── app.ts
    │   ├── conf
    │   │   └── conf.ts
    │   ├── constants.ts
    │   ├── controllers
    │   │   ├── comment.controller.ts
    │   │   ├── dashboard.controller.ts
    │   │   ├── healthCheck.controller.ts
    │   │   ├── like.controller.ts
    │   │   ├── playlist.controller.ts
    │   │   ├── subscription.controller.ts
    │   │   ├── tweet.controller.ts
    │   │   ├── user.controller.ts
    │   │   └── video.controller.ts
    │   ├── db
    │   │   └── index.ts
    │   ├── middlewares
    │   │   ├── auth.middleware.ts
    │   │   ├── error.middleware.ts
    │   │   └── multer.middleware.ts
    │   ├── models
    │   │   ├── comment.model.ts
    │   │   ├── like.model.ts
    │   │   ├── playlist.model.ts
    │   │   ├── subscription.model.ts
    │   │   ├── tweet.model.ts
    │   │   ├── user.model.ts
    │   │   └── video.model.ts
    │   ├── routes
    │   │   ├── comment.routes.ts
    │   │   ├── dashboard.routes.ts
    │   │   ├── healthCheck.routes.ts
    │   │   ├── index.ts
    │   │   ├── like.routes.ts
    │   │   ├── playlist.routes.ts
    │   │   ├── subscription.routes.ts
    │   │   ├── tweet.routes.ts
    │   │   ├── user.routes.ts
    │   │   └── video.routes.ts
    │   ├── server.ts
    │   ├── types
    │   │   ├── aggregation.types.ts
    │   │   ├── auth.d.ts
    │   │   └── types.ts
    │   └── utils
    │       ├── ApiError.ts
    │       ├── ApiResponse.ts
    │       ├── asyncHandler.ts
    │       └── cloudinary.ts
    ├── swaggerDoc.yaml
    └── tsconfig.json

32 directories, 102 files
```