import SideBar from "@/components/SideBar";

export default function RootLayout({ children }) {
  return (
    <div className="h-screen bg-gray-50 flex w-screen max-w-screen max-h-screen">
      <SideBar />

      <main className="w-full h-screen">{children}</main>
    </div>
  );
}
