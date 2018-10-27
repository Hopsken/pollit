export const STATS_TEAPLATE = `**No.___POLL_NO___ ___POLL_TITLE___**
> ___POLL_STATS___
>
`



export const getStatsTemplate  = ({
  number,
  title,
  stats
} = {}) =>
  STATS_TEAPLATE.replace('___POLL_NO___', number)
    .replace('___POLL_TITLE___', title)
    .replace('___POLL_STATS___', stats)
