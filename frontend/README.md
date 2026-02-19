# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Backend Integration Guide

To sync the backend with this frontend, please implement the following:

## 1. Environment Configuration
- The frontend expects the API to be running at `http://localhost:5000/api` by default.
- You can change this by setting `VITE_API_URL` in the `.env` file if needed.
- **CORS**: Ensure your backend allows requests from `http://localhost:5173` (or wherever the frontend is running).

## 2. Authentication Endpoints

### POST /api/auth/signup
**Payload:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "address": "string",
  "phone": "string",
  "gender": "string",
  "dob": "YYYY-MM-DD"
}
```

**Required Backend Validations:**
1.  **Age Check:** User must be 16 years or older based on `dob`.
2.  **Email Format:** Must be a valid Gmail (`@gmail.com`) or `.edu.np` address.
3.  **Password Strength:** Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
4.  **Password Match:** Ensure `password` matches `confirmPassword`.
5.  **Unique Email:** Check if email already exists.

**Responses:**
- **Success (201):**
  ```json
  {
    "user": { "id": 1, "email": "...", "firstName": "..." },
    "message": "Account created successfully"
  }
  ```
- **Error (400):**
  ```json
  {
    "message": "Specific error message here (e.g., 'User must be at least 16 years old')"
  }
  ```

### POST /api/auth/login
**Payload:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- **Success (200):**
  ```json
  {
    "user": { "id": 1, "email": "...", "token": "..." }
  }
  ```
- **Error (400/401):**
  ```json
  {
    "message": "Invalid credentials"
  }
  ```
