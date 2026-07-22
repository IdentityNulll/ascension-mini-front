import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend once, globally — all `import dayjs from 'dayjs'` share this instance.
dayjs.extend(isoWeek);

export default dayjs;
