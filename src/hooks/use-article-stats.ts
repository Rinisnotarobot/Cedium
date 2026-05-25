import { useQuery } from "@tanstack/react-query"
import { articleKeys } from "#/hooks/keys/article-keys"
import { getMyArticlesStatsFn } from "#/data/articles"

export function useMyArticlesStats() {
  return useQuery({
    queryKey: articleKeys.stats(),
    queryFn: () => getMyArticlesStatsFn({ data: undefined }),
  })
}