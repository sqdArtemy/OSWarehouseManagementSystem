export default function SignIn() {
  return (
    <div>
      <h1>Sign In</h1>
      <form>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Enter ID"
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
        />
        <button type="submit">SIGN UP</button>
      </form>
    </div>
  );
}
