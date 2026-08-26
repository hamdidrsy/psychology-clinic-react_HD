import { getProductionEnvironmentErrors } from "./production-env-validation";

const errors = getProductionEnvironmentErrors(process.env);

if (errors.length > 0) {
  console.error("Production ortam kontrolü başarısız:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    "Production ortam kontrolü başarılı. Secret değerleri yazdırılmadı.",
  );
}
