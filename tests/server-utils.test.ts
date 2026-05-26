import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGameListQuery } from "../server/utils/gameListQuery";
import {
  clampInteger,
  escapeApicalypseString,
  parseIgdbNumberList,
  parseIgdbSort,
} from "../server/utils/igdbQuery";
import { sanitizeHtml } from "../server/utils/sanitizeHtml";

test("parseGameListQuery drops invalid arrays and clamps pagination", () => {
  const parsed = parseGameListQuery(
    {
      platforms: "1,NaN,2,2",
      gameModes: ["3", "bad", "4"],
      limit: "9999",
      offset: "-20",
      sort: "name desc",
      status: ["pending,rejected", "invalid"],
    },
    { maxLimit: 100 }
  );

  assert.deepEqual(parsed.platforms, [1, 2]);
  assert.deepEqual(parsed.gameModes, [3, 4]);
  assert.equal(parsed.limit, 100);
  assert.equal(parsed.offset, 0);
  assert.deepEqual(parsed.statuses, ["pending", "rejected"]);
  assert.equal(parsed.sort.value, "-popularity");
});

test("parseGameListQuery keeps full search term and tolerates a literal %", () => {
  // Comma is a legitimate part of a free-text search term, not a separator
  assert.equal(
    parseGameListQuery({ search: "grand theft, vice" }).search,
    "grand theft, vice"
  );

  // getQuery already decodes; a stray % must not throw URIError
  assert.equal(parseGameListQuery({ search: "50%" }).search, "50%");
  assert.deepEqual(parseGameListQuery({ platforms: "50%,2" }).platforms, [2]);
});

test("parseGameListQuery falls back to a valid sort and never recurses", () => {
  assert.equal(
    parseGameListQuery({ sort: "bogus" }, { defaultSort: "-popularity" }).sort
      .value,
    "-popularity"
  );
});

test("igdb helpers escape strings, clamp numbers, and whitelist sort", () => {
  assert.equal(escapeApicalypseString('doom"\\\n'), 'doom\\"\\\\ ');
  assert.deepEqual(parseIgdbNumberList("1,nope,2,2"), [1, 2]);
  // Non-positive ids are invalid IGDB ids and must be dropped
  assert.equal(parseIgdbNumberList("0,-5"), undefined);
  assert.deepEqual(parseIgdbNumberList("0,3"), [3]);
  assert.equal(clampInteger("500", 60, 1, 100), 100);
  assert.equal(parseIgdbSort("name asc"), "name asc");
  assert.equal(parseIgdbSort("bad desc"), "aggregated_rating desc");
});

test("sanitizeHtml forces safe rel on target=_blank links", () => {
  const out = sanitizeHtml('<a href="https://x" target="_blank">x</a>');
  assert.match(out ?? "", /rel="noopener noreferrer"/);
});

test("sanitizeHtml strips executable HTML but preserves allowed rich text", () => {
  const sanitized = sanitizeHtml(
    "<p>Hello <strong>PC</strong><img src=x onerror=alert(1)><script>alert(1)</script></p>"
  );

  assert.equal(sanitized, "<p>Hello <strong>PC</strong></p>");
});
