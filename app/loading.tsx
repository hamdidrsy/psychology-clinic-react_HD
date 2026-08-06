import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="min-h-[60vh] py-20">
      <Container>
        <p className="sr-only">Sayfa yükleniyor</p>
        <div
          aria-hidden="true"
          className="max-w-3xl animate-pulse space-y-5 motion-reduce:animate-none"
        >
          <div className="bg-surface-muted h-4 w-28 rounded" />
          <div className="bg-surface-muted h-12 w-full rounded" />
          <div className="bg-surface-muted h-6 w-4/5 rounded" />
        </div>
      </Container>
    </main>
  );
}
