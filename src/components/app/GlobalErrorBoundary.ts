type CaughtError = Error & {
  response?: {
    data: [{ message?: string }];
    status: string;
  };
  config?: { url: string };
};

export const getErrorResource = (err: CaughtError) => {
  if (err.config?.url.includes("/institutions")) {
    return "/institutions";
  } else if (err.config?.url.includes("/members")) {
    return "/member";
  } else if (err.config?.url.includes("/micro_deposits")) {
    return "/micro_deposits";
  } else {
    return null;
  }
};
