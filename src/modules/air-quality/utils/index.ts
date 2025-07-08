const toMongoDateQuery = (
  field: string,
  from?: string | null,
  to?: string | null,
) => {
  const query: { $gte?: Date; $lte?: Date } = {};

  const isFromDefined = from != undefined && from != null;
  const isToDefined = to != undefined && to != null;

  if (!isFromDefined && !isToDefined) return null;
  if (isFromDefined) query['$gte'] = Date.parse(from) && new Date(from);
  if (isToDefined) query['$lte'] = Date.parse(to) && new Date(to);
  return { [field]: query };
};

enum INTERVAL {
  hourly = 'hourly',
  daily = 'daily',
  monthly = 'monthly',
  yearly = 'yearly',
}

const DATE_FORMAT = {
  [INTERVAL.hourly]: '%Y-%m-%d:%H',
  [INTERVAL.daily]: '%Y-%m-%d',
  [INTERVAL.monthly]: '%Y-%m',
  [INTERVAL.yearly]: '%Y',
};

export { toMongoDateQuery, INTERVAL, DATE_FORMAT };
