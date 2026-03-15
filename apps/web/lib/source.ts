import { loader } from "fumadocs-core/source";
import { docs } from "@/.source";

// fumadocs-mdx v11 returns `files` as a lazy function, but
// fumadocs-core v15.8 expects an array. Bridge the gap.
const mdxSource = docs.toFumadocsSource();
const files =
  typeof mdxSource.files === "function"
    ? (mdxSource.files as () => typeof mdxSource.files)()
    : mdxSource.files;

export const source = loader({
  baseUrl: "/docs",
  source: { files },
});
