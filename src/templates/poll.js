export const POLL_TEMPLATE = `**No: ___POLL_ID___**

> **Q: ___POLL_TITLE___**
> **A:**
> ___POLL_CHOICES___

> ___POLL_TIPS___`

export const getPollTemplate = ({
  pollId,
  title,
  choices,
  tips
} = {}) =>
  POLL_TEMPLATE.replace(/___POLL_ID___/g, pollId)
    .replace(/___POLL_TITLE___/g, title)
    .replace(/___POLL_CHOICES___/g, choices)
    .replace(/___POLL_TIPS___/g, tips)
