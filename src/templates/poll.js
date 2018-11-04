export const POLL_TEMPLATE = `**No: ___POLL_ID___ （___POLL_MULTI___）**

> **Q: ___POLL_TITLE___**
> **A:**
> ___POLL_CHOICES___

> ___POLL_TIPS___`

export const getPollTemplate = ({
  pollId,
  title,
  choices,
  tips,
  multi = '单选'
} = {}) =>
  POLL_TEMPLATE.replace(/___POLL_ID___/g, pollId)
    .replace(/___POLL_TITLE___/g, title)
    .replace(/___POLL_CHOICES___/g, choices)
    .replace(/___POLL_TIPS___/g, tips)
    .replace(/___POLL_MULTI___/g, multi)
