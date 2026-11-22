import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-emerald-950 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(6, 78, 59, 0.72), rgba(15, 23, 42, 0.55)), url('/images/bg-liquid.png')",
      }}
    >
      <div className="w-full max-w-md md:max-w-3xl relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
