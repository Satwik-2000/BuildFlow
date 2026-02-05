import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const typeDefsArray = loadFilesSync(path.join(__dirname, "schema"), {
  extensions: ["graphql"],
});

export default mergeTypeDefs(typeDefsArray);
