import { Alert } from "@/components/ui/alert";
import { contentNotice } from "@/lib/content";

export function ContentNotice() {
  return (
    <Alert title="İçerik doğrulaması bekleniyor" variant="warning">
      <p>
        {contentNotice} Bu uyarı production yayını öncesinde kaldırılacaktır.
      </p>
    </Alert>
  );
}
