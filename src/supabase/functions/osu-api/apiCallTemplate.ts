export async function osuApiRequest(
  { url, headers, errorString, method, body, params }: {
    url: string;
    headers: Record<string, string>;
    errorString: string;
    method: string;
    body?: BodyInit;
    params?: Record<string, string>;
  },
) {
  const urlApi = new URL(url);

  if (params) {
    Object.keys(params).forEach((key) =>
      urlApi.searchParams.append(key, params[key])
    );
  }

  let response: Response;
  try {
    response = await fetch(urlApi, {
      method,
      headers: headers,
      ...(body && { body: body }),
    });

    if (!response.ok) {
      console.error(`HTTP error: ${response.status} - ${response.statusText}`);
      console.error(`${errorString} - response was not ok!`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `${errorString} - try failed in osu API request funtion!...:`,
      error,
    );
    return null;
  }
}
