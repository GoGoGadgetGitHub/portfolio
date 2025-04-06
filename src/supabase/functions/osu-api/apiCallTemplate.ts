import { corsHeaders } from "../_shared/cors.ts";

export async function osuApiRequest(
  { url, headers, errorString, method, body, params }: {
    url: string;
    headers: object;
    errorString: string;
    method: string;
    body?: object;
    params?: object;
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
      console.error(
        `HTTP error: ${response.status} - ${response.statusText}`,
      );
      return new Response(`${errorString} - response was not ok!`, {
        headers: { ...corsHeaders },
        status: response.status,
      });
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
