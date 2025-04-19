export const fetchWithToken = async (url: string) => {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Errore nel fetch di ${url}`);
  }

  return res.json();
};
