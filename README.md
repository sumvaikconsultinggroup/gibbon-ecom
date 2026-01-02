
```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

---

## Environment Variables

For the PayU payment gateway integration, you need to add the following environment variables to your `.env.local` file:

```
# PayU Credentials
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt

# Public PayU variables
NEXT_PUBLIC_PAYU_KEY=your_payu_key
NEXT_PUBLIC_PAYU_URL=https://test.payu.in/_payment

# Base URL of your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Note:** For production, change `NEXT_PUBLIC_PAYU_URL` to the production URL provided by PayU.
