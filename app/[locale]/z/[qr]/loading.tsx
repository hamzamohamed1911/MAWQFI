import { BackToScan } from "@/components/home/back-to-scan";
import { Loading } from "@/components/home/Loading";

export default function QrBookingLoading() {
  return (
    <main className="relative flex min-h-[90vh] w-full flex-1 flex-col px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl pt-8 sm:pt-10">
        <BackToScan />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center pb-8">
        <Loading />
      </div>
    </main>
  );
}
