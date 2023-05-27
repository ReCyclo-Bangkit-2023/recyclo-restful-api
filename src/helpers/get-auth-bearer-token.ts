const getAuthBearerToken = (authValue: string): [string, string] => {
  const [authScheme, token] = authValue.split(' ');
  return [authScheme, token];
};

export default getAuthBearerToken;
