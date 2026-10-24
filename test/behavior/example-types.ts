export interface ExampleRows {
  'ADP-001': {
    host: string;
    kind: 'PlainDate' | 'PlainDateTime' | 'ZonedDateTime';
    value: string;
    local: string;
  };
  'ADP-002': {};
  'ADP-003': { value: string; year: string };
  'ADP-004': {};
  'ADP-005': { value: string };
  'ADP-006': {};
  'ADP-007': {};
  'ADP-008': {};
  'ADP-009': { input: string };
  'ADP-010': {};
  'ADP-011': { kind: 'PlainDate' | 'PlainDateTime'; value: string };
  'BND-001': {
    function:
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear';
    result: string;
  };
  'BND-002': {
    function:
      | 'endOfDay'
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear';
    result: string;
  };
  'BND-003': { weekday: string; start: string; end: string };
  'BND-004': {
    function:
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear';
    value: string;
    result: string;
  };
  'BND-005': {
    function: 'endOfQuarter' | 'endOfYear' | 'startOfQuarter' | 'startOfYear';
    value: string;
    result: string;
  };
  'BND-006': { value: string };
  'BND-007': { value: string; hours: string; offset: string };
  'BND-008': {};
  'BND-009': {};
  'BND-010': { function: 'endOfMonth' | 'endOfQuarter' | 'endOfYear'; result: string };
  'BND-011': {};
  'BND-012': { function: 'endOfWeek' | 'startOfWeek'; weekday: string };
  'BND-013': {
    function:
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfYear'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfYear';
    value: string;
  };
  'BND-014': {};
  'BND-015': {
    function:
      | 'endOfDay'
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear';
    result: string;
  };
  'BND-016': {};
  'BUS-001': {
    function: 'addBusinessDays' | 'subBusinessDays';
    value: string;
    amount: string;
    result: string;
  };
  'BUS-002': { function: 'addBusinessDays' | 'subBusinessDays' };
  'BUS-003': {
    function: 'addBusinessDays' | 'subBusinessDays';
    amount: string;
    weekends: string;
    result: string;
  };
  'BUS-004': { value: string; context: string; weekend: string; business: string };
  'BUS-005': { earlier: string; later: string; context: string; count: string; reverse: string };
  'BUS-006': {};
  'BUS-007': {};
  'BUS-008': {};
  'BUS-009': {
    function: 'addBusinessDays' | 'subBusinessDays';
    value: string;
    amount: string;
    context: string;
    result: string;
  };
  'BUS-010': { later: string; context: string };
  'BUS-011': { function: 'addBusinessDays' | 'subBusinessDays'; weekends: string };
  'BUS-012': { function: 'addBusinessDays' | 'subBusinessDays'; amount: string };
  'BUS-013': {};
  'BUS-014': {};
  'BUS-015': { function: 'addBusinessDays' | 'subBusinessDays'; amount: string };
  'BUS-016': {};
  'BUS-017': {
    function: 'differenceInBusinessDays' | 'eachWeekendOfInterval' | 'isBusinessDay' | 'isWeekend';
  };
  'CAL-001': { function: 'nextDay' | 'previousDay'; weekday: string; result: string };
  'CAL-002': {};
  'CAL-003': { function: 'nextDay' | 'previousDay'; value: string; result: string };
  'CAL-004': { function: 'nextDay' | 'previousDay'; weekday: string };
  'CAL-005': {
    kind: 'PlainDate' | 'PlainDateTime' | 'PlainMonthDay' | 'PlainYearMonth' | 'ZonedDateTime';
    value: string;
    quarter: string;
  };
  'CAL-006': { value: string; options: string; week: string; year: string };
  'CAL-007': { value: string };
  'CAL-008': { value: string; options: string; week: string };
  'CAL-009': {
    kind: 'PlainDate' | 'PlainDateTime' | 'PlainYearMonth';
    value: string;
    options: string;
    weeks: string;
  };
  'CAL-010': { function: 'getWeek' | 'getWeekYear'; anchor: string };
  'CAL-011': { zone: string; quarter: string };
  'CAL-012': {};
  'CAL-013': {
    function: 'getWeek' | 'getWeekOfMonth' | 'getWeekYear' | 'getWeeksInMonth';
    weekday: string;
  };
  'CAL-014': { value: string };
  'SEL-001': {
    kind:
      | 'Instant'
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime';
    first: string;
    middle: string;
    last: string;
  };
  'SEL-002': {
    kind:
      | 'Instant'
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime';
    target: string;
    left: string;
    right: string;
  };
  'SEL-003': { function: 'closestIndexTo' | 'closestTo' | 'max' | 'min' };
  'SEL-004': { function: 'max' | 'min' };
  'SEL-005': {};
  'SEL-006': {};
  'SEL-007': {};
  'SEL-008': {};
  'SEL-009': {};
  'SEL-010': { function: 'closestIndexTo' | 'closestTo' | 'max' | 'min' };
  'SEL-011': { function: 'closestIndexTo' | 'closestTo' };
  'SEL-012': {};
  'SEL-013': {};
  'CMP-001': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
    first: string;
    second: string;
    result: string;
  };
  'CMP-002': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
  };
  'CMP-003': { function: 'isSameISOWeek' | 'isSameWeek' };
  'CMP-004': {};
  'CMP-005': { weekday: string; result: string };
  'CMP-011': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
  };
  'CMP-012': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
  };
  'CMP-006': {
    function: 'isSameMonth' | 'isSameQuarter' | 'isSameYear';
    other: string;
    result: string;
  };
  'CMP-007': { zone: string; result: string };
  'CMP-008': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
  };
  'CMP-009': {
    function:
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear';
  };
  'CMP-010': { weekday: string; result: string };
  'CON-001': {};
  'CON-002': {};
  'CON-003': {};
  'CON-004': {
    function:
      | 'addBusinessDays'
      | 'eachMonthOfInterval'
      | 'endOfQuarter'
      | 'format'
      | 'getQuarter'
      | 'isSameMonth'
      | 'min'
      | 'parse'
      | 'startOfYear'
      | 'toCalendarDate';
    kind: 'PlainDate' | 'PlainDateTime' | 'PlainMonthDay' | 'PlainYearMonth' | 'ZonedDateTime';
    fields: string;
    arguments: string;
  };
  'CON-005': {
    function:
      | 'endOfWeek'
      | 'getWeek'
      | 'getWeekOfMonth'
      | 'getWeekYear'
      | 'getWeeksInMonth'
      | 'isBusinessDay'
      | 'isWeekend'
      | 'startOfWeek';
    options: string;
  };
  'CON-006': {
    function:
      | 'eachDayOfInterval'
      | 'format'
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDuration'
      | 'getWeek'
      | 'isWeekend'
      | 'startOfWeek';
    options: string;
  };
  'CON-007': {
    function:
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDistanceToNow'
      | 'formatDistanceToNowStrict'
      | 'formatDuration'
      | 'formatRelative';
  };
  'CON-008': {
    function:
      | 'addBusinessDays'
      | 'areIntervalsOverlapping'
      | 'clamp'
      | 'closestIndexTo'
      | 'closestTo'
      | 'differenceInBusinessDays'
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval'
      | 'endOfDay'
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'format'
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDistanceToNow'
      | 'formatDistanceToNowStrict'
      | 'formatDuration'
      | 'formatRelative'
      | 'fromCalendarDate'
      | 'getQuarter'
      | 'getWeek'
      | 'getWeekOfMonth'
      | 'getWeekYear'
      | 'getWeeksInMonth'
      | 'isBusinessDay'
      | 'isMatch'
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear'
      | 'isWeekend'
      | 'isWithinInterval'
      | 'max'
      | 'min'
      | 'nextDay'
      | 'parse'
      | 'parseDuration'
      | 'previousDay'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear'
      | 'subBusinessDays'
      | 'toCalendarDate'
      | 'tryParse'
      | 'tryParseDuration';
    kind: 'Date' | 'Duration' | 'PlainDate' | 'PlainTime' | 'string';
  };
  'CON-009': {};
  'CON-010': {};
  'TS-001': {
    function:
      | 'addBusinessDays'
      | 'clamp'
      | 'eachMonthOfInterval'
      | 'endOfDay'
      | 'fromCalendarDate'
      | 'min'
      | 'parse'
      | 'startOfQuarter';
    inputs: string;
    type: string;
  };
  'TS-002': {
    function:
      | 'format'
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDistanceToNow'
      | 'formatDistanceToNowStrict'
      | 'formatRelative'
      | 'isMatch'
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear'
      | 'parse'
      | 'tryParse';
    inputs: string;
  };
  'TS-003': {
    function:
      | 'areIntervalsOverlapping'
      | 'clamp'
      | 'closestIndexTo'
      | 'closestTo'
      | 'differenceInBusinessDays'
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval'
      | 'formatDistance'
      | 'isSameDay'
      | 'isSameMonth'
      | 'isWithinInterval'
      | 'max'
      | 'min';
    inputs: string;
  };
  'TS-004': { function: 'tryParse' | 'tryParseDuration'; tuple: string; result: string };
  'TS-005': {
    function:
      | 'addBusinessDays'
      | 'endOfDay'
      | 'format'
      | 'formatRelative'
      | 'getWeeksInMonth'
      | 'isSameDay'
      | 'isSameMonth'
      | 'parse'
      | 'toCalendarDate';
    inputs: string;
  };
  'TS-006': { function: 'isMatch' | 'parse' | 'tryParse' };
  'TS-007': { function: 'tryParse' | 'tryParseDuration' };
  'TS-008': { function: 'closestIndexTo' | 'closestTo' | 'max' | 'min' };
  'DUR-001': {};
  'DUR-002': { options: string; text: string };
  'DUR-003': { value: string; options: string; text: string };
  'DUR-004': { text: string; component: string; amount: string };
  'DUR-005': { text: string; components: string };
  'DUR-006': { text: string; hours: string; minutes: string };
  'DUR-007': {};
  'DUR-008': { text: string };
  'DUR-009': {};
  'DUR-010': { text: string };
  'DUR-011': { options: string };
  'DUR-012': {};
  'DUR-013': { text: string };
  'DUR-014': {};
  'DUR-015': {};
  'DUR-016': { text: string; component: string };
  'DUR-017': { input: string };
  'FMT-001': { pattern: string; text: string };
  'FMT-002': { value: string; pattern: string; text: string };
  'FMT-003': { value: string; text: string };
  'FMT-004': { pattern: string; text: string };
  'FMT-005': {
    kind: 'PlainMonthDay' | 'PlainTime' | 'PlainYearMonth';
    value: string;
    pattern: string;
    text: string;
  };
  'FMT-006': {
    kind: 'PlainDate' | 'PlainMonthDay' | 'PlainTime' | 'PlainYearMonth';
    value: string;
    pattern: string;
  };
  'FMT-007': { pattern: string };
  'FMT-008': { zone: string; text: string };
  'FMT-009': {};
  'FMT-010': {};
  'FMT-011': {
    kind: 'PlainDate' | 'PlainDateTime' | 'PlainMonthDay' | 'PlainTime' | 'PlainYearMonth';
    value: string;
    pattern: string;
  };
  'FMT-012': {
    kind: 'PlainDate' | 'PlainMonthDay' | 'PlainYearMonth';
    value: string;
    pattern: string;
    locale: string;
    text: string;
  };
  'FMT-013': {};
  'FMT-014': { value: string; text: string };
  'FMT-015': {};
  'FMT-016': {};
  'FMT-017': { options: string };
  'INT-001': { value: string; result: string };
  'INT-002': { value: string; object: 'start' | 'end' | 'input' };
  'INT-003': { start: string; end: string; options: string; result: string };
  'INT-004': { point: string; options: string; result: string };
  'INT-005': { options: string; result: string };
  'INT-006': {};
  'INT-007': { function: 'areIntervalsOverlapping' | 'clamp' | 'isWithinInterval' };
  'INT-008': { value: string; result: string };
  'INT-009': {};
  'INT-010': { function: 'areIntervalsOverlapping' | 'clamp' | 'isWithinInterval'; inputs: string };
  'INT-011': { value: string };
  'INT-012': {
    kind:
      | 'Instant'
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime';
    a: string;
    b: string;
    c: string;
    d: string;
  };
  'PAR-001': {
    kind:
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainMonthDay'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime';
    reference: string;
    text: string;
    pattern: string;
    result: string;
  };
  'PAR-002': {
    kind: 'PlainDate' | 'PlainDateTime' | 'PlainMonthDay' | 'PlainTime' | 'PlainYearMonth';
    reference: string;
    text: string;
    pattern: string;
    result: string;
  };
  'PAR-003': {};
  'PAR-004': { text: string };
  'PAR-005': {};
  'PAR-006': { text: string; matches: string; outcome: string };
  'PAR-007': { text: string; pattern: string };
  'PAR-008': { text: string; result: string };
  'PAR-009': {
    kind: 'PlainDate' | 'PlainMonthDay' | 'PlainTime' | 'PlainYearMonth';
    reference: string;
    text: string;
    pattern: string;
  };
  'PAR-010': {};
  'PAR-011': { text: string; pattern: string; zone: string; result: string };
  'PAR-012': {
    kind: 'Instant' | 'PlainDate' | 'PlainTime' | 'ZonedDateTime';
    reference: string;
    context: string;
  };
  'PAR-013': { policy: string; result: string };
  'PAR-014': { context: string; result: string };
  'PAR-015': { text: string };
  'PAR-016': {};
  'PAR-017': {};
  'PAR-018': { text: string; pattern: string };
  'PAR-019': { text: string; pattern: string };
  'PAR-020': {};
  'PAR-021': {};
  'PAR-022': {
    kind: 'PlainDate' | 'PlainTime';
    reference: string;
    text: string;
    pattern: string;
    result: string;
  };
  'PAR-023': { text: string };
  'PAR-024': { policy: string };
  'PAR-025': { function: 'isMatch' | 'parse' | 'tryParse' };
  'PAR-026': {};
  'PAR-027': { function: 'isMatch' | 'parse' | 'tryParse'; input: string };
  'REL-001': { seconds: string; text: string };
  'REL-002': { seconds: string; text: string };
  'REL-003': {
    function: 'formatDistance' | 'formatDistanceStrict';
    seconds: string;
    options: string;
    text: string;
  };
  'REL-004': { seconds: string; text: string };
  'REL-005': { seconds: string; rounding: string; text: string };
  'REL-006': { unit: string; text: string };
  'REL-007': { base: string; value: string; unit: string; text: string };
  'REL-008': { base: string; unit: string; text: string };
  'REL-009': {};
  'REL-010': { days: string; text: string };
  'REL-011': { value: string; 'date phrase': string };
  'REL-012': {};
  'REL-013': { function: 'formatDistance' | 'formatDistanceStrict' | 'formatRelative' };
  'REL-014': { function: 'formatDistance' | 'formatDistanceStrict'; text: string };
  'REL-015': { kind: 'Instant' | 'PlainDate' | 'PlainDateTime' | 'ZonedDateTime'; value: string };
  'REL-016': { function: 'formatDistanceToNow' | 'formatDistanceToNowStrict'; options: string };
  'REL-017': {};
  'REL-018': {};
  'REL-019': {
    function: 'formatDistanceToNow' | 'formatDistanceToNowStrict';
    kind: 'Instant' | 'PlainDate' | 'PlainDateTime';
    value: string;
  };
  'REL-020': { options: string };
  'REL-021': {};
  'REL-022': { base: string; value: string; unit: string; text: string };
  'REL-023': { options: string };
  'REL-024': { function: 'formatDistance' | 'formatDistanceStrict' | 'formatRelative' };
  'REL-025': { function: 'formatDistance' | 'formatDistanceStrict' | 'formatRelative' };
  'REL-026': { options: string; text: string };
  'REL-027': { rounding: string; text: string };
  'REL-028': {};
  'REL-029': { nanoseconds: string; rounding: string; text: string };
  'REL-030': {};
  'RNG-001': { unit: string; rounding: string; text: string };
  'RNG-002': { value: 'earlier' | 'later'; base: 'earlier' | 'later'; text: string };
  'RNG-003': { kind: 'Instant with explicit timeZone' | 'ZonedDateTime'; zone: string };
  'RNG-004': {};
  'RNG-005': { boundary: string; direction: string; unit: string };
  'RNG-006': { nanoseconds: string; text: string };
  'RNG-007': { edge: string; zone: string };
  'RNG-008': {};
  'RNG-009': {};
  'RNG-010': { unit: string; text: string };
  'RNG-011': { kind: 'PlainDate' | 'PlainDateTime'; value: string; years: string };
  'RNG-012': { edge: string; zone: string; unit: string };
  'RNG-013': { base: string; midpoint: string; unit: string; nanoseconds: string; text: string };
  'SEQ-001': { options: string; values: string };
  'SEQ-002': {};
  'SEQ-003': { options: string; values: string };
  'SEQ-004': { options: string; values: string };
  'SEQ-005': { options: string; values: string };
  'SEQ-006': { options: string; values: string };
  'SEQ-007': {
    function: 'eachHourOfInterval' | 'eachMinuteOfInterval';
    start: string;
    end: string;
    options: string;
    values: string;
  };
  'SEQ-008': { function: 'eachHourOfInterval' | 'eachMinuteOfInterval'; step: string };
  'SEQ-009': {
    function: 'eachHourOfInterval' | 'eachMinuteOfInterval';
    start: string;
    end: string;
    values: string;
  };
  'SEQ-010': {};
  'SEQ-011': {};
  'SEQ-012': {};
  'SEQ-013': {};
  'SEQ-014': {};
  'SEQ-015': {
    function:
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval';
    kind: 'PlainDate' | 'PlainTime' | 'PlainYearMonth';
    value: string;
    result: string;
  };
  'SEQ-016': {
    function:
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval';
    kind: 'PlainDate' | 'PlainTime' | 'PlainYearMonth';
    start: string;
    end: string;
  };
  'SEQ-017': {
    function:
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval';
    step: string;
  };
  'SEQ-018': {
    function:
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval';
  };
  'SEQ-019': {};
  'SEQ-020': {};
  'SEQ-021': { function: 'eachWeekOfInterval' | 'eachWeekendOfInterval'; options: string };
  'SEQ-022': { function: 'eachMonthOfInterval' | 'eachWeekOfInterval'; options: string };
  'SEQ-023': {};
  'SEQ-024': {};
  'SEQ-025': { function: 'eachHourOfInterval' | 'eachMinuteOfInterval' };
  'SEQ-026': {
    function:
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval';
  };
  'SEQ-027': {};
  'SEQ-028': {
    function: 'eachMonthOfInterval' | 'eachWeekOfInterval';
    start: string;
    end: string;
    values: string;
  };
  'TYPE-001': {
    function:
      | 'addBusinessDays'
      | 'areIntervalsOverlapping'
      | 'clamp'
      | 'closestIndexTo'
      | 'closestTo'
      | 'differenceInBusinessDays'
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval'
      | 'endOfDay'
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'format'
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDistanceToNow'
      | 'formatDistanceToNowStrict'
      | 'formatDuration'
      | 'formatRelative'
      | 'fromCalendarDate'
      | 'getQuarter'
      | 'getWeek'
      | 'getWeekOfMonth'
      | 'getWeekYear'
      | 'getWeeksInMonth'
      | 'isBusinessDay'
      | 'isMatch'
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear'
      | 'isWeekend'
      | 'isWithinInterval'
      | 'max'
      | 'min'
      | 'nextDay'
      | 'parse'
      | 'parseDuration'
      | 'previousDay'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear'
      | 'subBusinessDays'
      | 'toCalendarDate'
      | 'tryParse'
      | 'tryParseDuration';
    kind:
      | 'Date'
      | 'Duration'
      | 'Instant'
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainMonthDay'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime'
      | 'string';
  };
  'TYPE-002': {
    function:
      | 'addBusinessDays'
      | 'areIntervalsOverlapping'
      | 'clamp'
      | 'closestIndexTo'
      | 'closestTo'
      | 'differenceInBusinessDays'
      | 'eachDayOfInterval'
      | 'eachHourOfInterval'
      | 'eachMinuteOfInterval'
      | 'eachMonthOfInterval'
      | 'eachWeekOfInterval'
      | 'eachWeekendOfInterval'
      | 'endOfDay'
      | 'endOfISOWeek'
      | 'endOfMonth'
      | 'endOfQuarter'
      | 'endOfWeek'
      | 'endOfYear'
      | 'format'
      | 'formatDistance'
      | 'formatDistanceStrict'
      | 'formatDistanceToNow'
      | 'formatDistanceToNowStrict'
      | 'formatDuration'
      | 'formatRelative'
      | 'fromCalendarDate'
      | 'getQuarter'
      | 'getWeek'
      | 'getWeekOfMonth'
      | 'getWeekYear'
      | 'getWeeksInMonth'
      | 'isBusinessDay'
      | 'isMatch'
      | 'isSameDay'
      | 'isSameISOWeek'
      | 'isSameMonth'
      | 'isSameQuarter'
      | 'isSameWeek'
      | 'isSameYear'
      | 'isWeekend'
      | 'isWithinInterval'
      | 'max'
      | 'min'
      | 'nextDay'
      | 'parse'
      | 'parseDuration'
      | 'previousDay'
      | 'startOfISOWeek'
      | 'startOfMonth'
      | 'startOfQuarter'
      | 'startOfWeek'
      | 'startOfYear'
      | 'subBusinessDays'
      | 'toCalendarDate'
      | 'tryParse'
      | 'tryParseDuration';
    kind:
      | 'Date'
      | 'Duration'
      | 'Instant'
      | 'PlainDate'
      | 'PlainDateTime'
      | 'PlainMonthDay'
      | 'PlainTime'
      | 'PlainYearMonth'
      | 'ZonedDateTime'
      | 'string';
  };
}
