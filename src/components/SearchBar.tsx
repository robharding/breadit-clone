"use client";

import { FC, useCallback, useState } from "react";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { CommandEmpty, CommandGroup } from "cmdk";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState<string>("");

  const router = useRouter();

  const request = debounce(() => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];

      console.log("fetching...");

      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  return (
    <Command className="relative rounded-lg border max-w-sm z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        placeholder="Search communities"
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
      />

      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities" className="p-2">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  onSelect={() => {
                    router.push(`/r/${subreddit.name}`);
                    router.refresh();
                  }}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
