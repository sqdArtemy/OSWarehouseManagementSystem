export default function SignUp() {
  return (
    <div>
      <h1>Sign Up</h1>
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
        <button type="submit">SIGN IN</button>
      </form>
    </div>
  );
}
