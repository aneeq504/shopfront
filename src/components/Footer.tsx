import { Mascot, Wave } from "./Doodles";

export function Footer() {
  return (
    <footer className="mt-16">
      <Wave className="block h-12 w-full" />
      <div className="bg-mint px-4 pb-6 pt-2 text-ink">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3 text-center font-display font-semibold sm:text-left">
            <Mascot className="h-10 w-10 shrink-0" />
            <span>ShopFront — cash on delivery, cancel free within 24 hours</span>
          </div>
          <span className="text-sm font-semibold">© {new Date().getFullYear()} ShopFront</span>
        </div>
      </div>
    </footer>
  );
}
