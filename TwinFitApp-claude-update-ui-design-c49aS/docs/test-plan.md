# TwinFit Manual Test Plan

## Backend

1) Health
```bash
curl http://localhost:4000/health
```

2) Register
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","surname":"User","username":"testuser","email":"test@example.com","password":"pass1234"}'
```

3) Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"pass1234"}'
```

4) Check-in
```bash
curl -X POST http://localhost:4000/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"photoUrl":"https://example.com/scan.jpg"}'
```

## App

- Sign Up → Onboarding → Main tabs
- Sign In → Main tabs
- Home → Check-in camera → Confirm (shows success)
- Profile header shows avatar + streak + badges
