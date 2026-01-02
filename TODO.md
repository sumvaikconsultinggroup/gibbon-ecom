# TODO: Store User Data in DB After Clerk Sign-Up/Sign-In

## Tasks
- [ ] Install svix package for webhook verification
- [ ] Add clerkId field to User model in src/models/User.ts
- [ ] Create webhook endpoint at src/app/api/webhooks/clerk/route.ts to handle 'user.created' events
- [ ] Update src/app/api/users/[id]/route.ts to use the main User model from src/models/User.ts
- [ ] Remove redundant src/app/api/users/[id]/User.js
- [ ] Test the webhook by signing up a user and verifying data is stored in DB
- [ ] Configure Clerk webhook URL in Clerk dashboard (manual step)

## Notes
- Webhook will listen for 'user.created' event from Clerk
- On user creation, extract name, email, and other data from Clerk payload
- Save user data to MongoDB using the User model
- Ensure DB connection is established in webhook
