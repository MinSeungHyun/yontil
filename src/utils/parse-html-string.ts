/**
 * Parses HTML string to extract input tag id-value pairs
 *
 * @param htmlString - Raw HTML string to parse
 * @returns Object containing input tag id-value pairs, where keys are input ids and values are the corresponding input values
 *
 * @example
 * ```ts
 * const html = '<input id="foo" value="bar" />';
 * const result = parseInputTagsFromHtml(html);
 * // result = { foo: 'bar' }
 * ```
 */
export function parseInputTagsFromHtml(
  htmlString: string
): Record<string, string> {
  const inputRegex =
    /<input[^>]*\sid=["']([^"']*)["'][^>]*\svalue=["']([^"']*)["'][^>]*>/gi

  const inputAttributes: Record<string, string> = {}
  let match: RegExpExecArray | null

  while ((match = inputRegex.exec(htmlString)) !== null) {
    const id = match[1]
    const value = match[2]
    inputAttributes[id] = value
  }

  return inputAttributes
}
