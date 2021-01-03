#!/usr/bin/env node
/* UCC library to convert UCC dates to ISO 8601 dates and vice-versa,
 * provide a UCCDate() object with properties detailing aspects
 * of a UCC date.
 *
 * by Prajna
 *
 * version 1.0.6 17th Leoâ™Œ 13517 - exposed some constants
 * version 1.0.5 10th Leoâ™Œ 13517 - replaced entity refs with unicode refs
 * version 1.0.4 7th Leoâ™Œ 13517 - added festivalNumber()
 * version 1.0.3 4th Leoâ™Œ 13517 - added intercals()
 * version 1.0.2 2nd Leoâ™Œ 13517
 * version 1.0.1 30th Cancerâ™‹ 13517
 * started 10th Cancerâ™‹ 13517
 *
 * Unix epoc = 1970-01-01T00:00:00Z = 13470.10.12
 * UTC 0.0.0 = -011502-03-21T00:00:00.000Z = -425,130,768,000,000 milliseconds before the Unix Epoc
 */
 "use strict";
 
function UCCDate() {
  
  // constants
  const VERSION = '1.0.6';
  const OFFSET = Date.UTC(-11502, 2, 21);  // offset of UCC Epoc from Unix Epoc in milliseconds
  const ONE_DAY = 86400000; // 24 * 60 * 60 * 1000 ms
  const ONE_YEAR = 31536000000; // 365 * 24 * 60 * 60 * 1000 ms
  const TROPICAL_YEAR = 365.242424242; // tropical year in days
  const ONE_AD = 4200940 * ONE_DAY; // 1 Jan 0001 is 4200940 days since UCC Epoc
  const MOON_PERIOD = 29.530588853; // period for calculating moon phase
  
  // lookup tables
  const TRIADS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const TSYMBOLS = ['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
  const DECANS = ['Neptune','Sol','Mercury','Venus','Earth','Mars','Ceres','Jupiter','Saturn','Uranus'];
  const HICANS = ['Varuna','Surya','Budha','Shukra','Thal','Mangala','Shakti','Guru','Shani','Vasuki'];
  const GREECANS = ['Poseidon','Helios','Hermes','Aphrodite','Terra','Ares','Demeter','Zeus','Cronus','Caelus'];
  const DSYMBOLS = ['\u2646','\u2609','\u263F','\u2640','\u2295','\u2642','\u26B3','\u2643','\u2644','\u2645'];
  const MOONS = ['New','Waxing crescent','1st quarter','Waxing gibbous','Full','Waning gibbous','3rd quarter','Waning crescent'];
  const MSYMBOLS = ['\uD83C\uDF11','\uD83C\uDF12','\uD83C\uDF13','\uD83C\uDF14','\uD83C\uDF15','\uD83C\uDF16','\uD83C\uDF17','\uD83c\uDF18'];
    
  //****************** Moon phase ******************
  
  // calculate the moon phase
  function moonPhase(date) {
    var fullMoon = new UCCDate(Date.UTC(1999, 7, 11));
    // get the difference in days between this date and the full moon date in August 1999
    var days = (fullMoon.days < date.days ? date.days - fullMoon.days : fullMoon.days - date.days);
    var phase = (days + MOON_PERIOD) % MOON_PERIOD;
    if (phase < 1)
      return MOONS[0];
    if (phase < 7)
      return MOONS[1];
    if (phase < 8)
      return MOONS[2];
    if (phase < 15)
      return MOONS[3];
    if (phase < 16)
      return MOONS[4];
    if (phase < 22)
      return MOONS[5];
    if (phase < 23)
      return MOONS[6];
    return MOONS[7];
  }
  
  // return the moon phase symbol
  function moonSymbol(date) {
    var fullMoon = new UCCDate(Date.UTC(1999, 7, 11));
    // get the difference in days between this date and the full moon date in August 1999
    var days = (fullMoon.days < date.days ? date.days - fullMoon.days : fullMoon.days - date.days);
    var phase = (days + MOON_PERIOD) % MOON_PERIOD;
    if (phase < 1)
      return MSYMBOLS[0];
    if (phase < 7)
      return MSYMBOLS[1];
    if (phase < 8)
      return MSYMBOLS[2];
    if (phase < 15)
      return MSYMBOLS[3];
    if (phase < 16)
      return MSYMBOLS[4];
    if (phase < 22)
      return MSYMBOLS[5];
    if (phase < 23)
      return MSYMBOLS[6];
    return MSYMBOLS[7];
  }
  
  //****************** Ages *****************
  
  // return the current yuga/age
  function yuga(date) {
    var year = date.year % 24000;
    if (year < 4800)
      return year +' Satya Yuga (Golden Age) Descending';
    if (year < 8400)
      return (year - 4800) + ' Treta Yuga (Silver Age) Descending';
    if (year < 10800)
      return (year - 8400) + ' Dwapara Yuga (Bronze Age) Descending';
    if (year < 12000)
      return (year - 10800) + ' Kali Yuga (Iron Age) Descending';
    if (year < 13200)
      return (year - 12000) + ' Kali Yuga (Iron Age) Ascending';
    if (year < 15600)
      return (year - 13200) + ' Dwapara Yuga (Bronze Age) Ascending';
    if (year < 19200)
      return (year - 15600) + ' Treta Yuga (Silver Age) Ascending';
    return (year - 19200) + ' Satya Yuga (Golden Age) Ascending';
  }
  
  // return the current Zodiac Age
  function zodiac(date) {
    var year = date.year % 24000;
    if (year < 1833)
      return year + ' Virgo, Great Summer Descending';
    if (year < 3733)
      return (year - 1833) + ' Leo, Great Summer Descending';
    if (year < 5699)
      return (year - 3733) + ' Cancer, Great Summer Descending';
    if (year < 7732)
      return (year - 5699) + ' Gemini, Great Autumn Descending';
    if (year < 9832)
      return (year - 7732) + ' Taurus, Great Autumn Descending';
    if (year < 12000)
      return (year - 9832) + ' Aries, Great Autumn Descending';
    if (year < 14168)
      return (year - 12000) + ' Pisces, Great Winter Ascending';
    if (year < 16268)
      return (year - 14168) + ' Aquarius, Great Winter Ascending';
    if (year < 18301)
      return (year - 16268) + ' Capricorn, Great Winter Ascending';
    if (year < 20267)
      return (year - 18301) + ' Sagittarius, Great Spring Ascending';
    if (year < 22167)
      return (year - 20267) + ' Scorpio, Great Spring Ascending';
    return (year - 22167) + ' Libra, Great Spring Ascending';
  }
  
  //****************** festivals & intercalary days*****************
  
  // return the day name if this is a intercalary day
  function intercal(date) {
    if (date.doy == 0)
      return 'Leap Year\'s';
    else if (date.doy == 1)
      return 'New Year\'s';
    else if (date.doy == 2)
      return '1st Season\'s';
    else if (date.doy == 93)
      return '2nd Season\'s';
    else if (date.doy == 184)
      return '3rd Season\'s';
    else if (date.doy == 275)
      return '4th Season\'s';
    return '';
  }
   
  // how many intercalary days so far this year
  function intercals(date) {
    if (date.doy < 2)
      return date.doy;
    else if (date.doy < 93)
      return isLeapYear() ? 3 : 2;
    else if (date.doy < 184)
      return isLeapYear() ? 4 : 3;
    else if (date.doy < 275)
      return isLeapYear() ? 5 : 4;
    return isLeapYear() ? 6 : 5;
  }
   
  // return the day symbol if this is a intercalary day
  function intercalSymbol(date) {
    if (date.doy == 0)
      return '\u2736';
    else if (date.doy == 1)
      return '\u2742';
    else if (date.doy == 2)
      return '\u25F7';
    else if (date.doy == 93)
      return '\u25F4';
    else if (date.doy == 184)
      return '\u25F5';
    else if (date.doy == 275)
      return '\u25F6';
    return '';
  }
   
  // return the festival name if this is a festival
  function festival(date) {
    if (date.doy > 363 || date.doy < 3)
      return 'Aries';
    else if (date.doy > 46 && date.doy < 49)
      return 'Taurus';
    else if (date.doy > 91 && date.doy < 95)
      return 'Cancer';
    else if (date.doy > 137 && date.doy < 140)
      return 'Leo';
    else if (date.doy > 183 && date.doy < 188)
      return 'Libra';
    else if (date.doy > 228 && date.doy < 231)
      return 'Scorpio';
    else if (date.doy > 274 && date.doy < 278)
      return 'Capricorn';
    else if (date.doy > 319 && date.doy < 322)
      return 'Aquarius';
    return '';
  }
  
  // return the festival name if this is a festival
  function festivalNumber(date) {
    if (date.doy > 363 || date.doy < 3)
      return 1;
    else if (date.doy > 46 && date.doy < 49)
      return 2;
    else if (date.doy > 91 && date.doy < 95)
      return 3;
    else if (date.doy > 137 && date.doy < 140)
      return 4;
    else if (date.doy > 183 && date.doy < 188)
      return 5;
    else if (date.doy > 228 && date.doy < 231)
      return 6;
    else if (date.doy > 274 && date.doy < 278)
      return 7;
    else if (date.doy > 319 && date.doy < 322)
      return 8;
    return 0;
  }
  
  // return the festival symbol if this is a festival
  function festivalSymbol(date) {
    if (date.doy > 363 || date.doy < 3)
      return '\u2295\u2648';
    else if (date.doy > 46 && date.doy < 49)
      return '\u2297\u2649';
    else if (date.doy > 91 && date.doy < 95)
      return '\u2295\u264B';
    else if (date.doy > 137 && date.doy < 140)
      return '\u2297\u264C';
    else if (date.doy > 183 && date.doy < 188)
      return '\u2295\u264E';
    else if (date.doy > 228 && date.doy < 231)
      return '\u2297\u264F';
    else if (date.doy > 274 && date.doy < 278)
      return '\u2295\u2651';
    else if (date.doy > 319 && date.doy < 322)
      return '\u2297\u2652';
    return '';
  }
  
  //****************** decans ********************
  
  // return the decan number
  function deekNumber(date) {
    // intercalary days have no decan association
    if (date.triad == 0 || date.day == 0)
      return 0;
    // 3 decans per triad plus decans so far this triad
    return (((date.triad - 1) * 3) + Math.floor((date.day - 1) / 10) + 1);
  }
  
  // return decan day name
  function deekDay(date) {
    // intercalary days have no decan association
    if (date.triad == 0 || date.day == 0)
      return '';
    return DECANS[(date.day + 10) % 10];
  }
  
  // return greek decan day name
  function greekDay(date) {
    // intercalary days have no decan association
    if (date.triad == 0 || date.day == 0)
      return '';
    return GREECANS[(date.day + 10) % 10];
  }
  
  // return hindi decan day name
  function hindDay(date) {
    // intercalary days have no decan association
    if (date.triad == 0 || date.day == 0)
      return '';
    return HICANS[(date.day + 10) % 10];
  }
  
  // return decan day symbol
  function deekSymbol(date) {
    // intercalary days have no decan association
    if (date.triad == 0 || date.day == 0)
      return '';
    return DSYMBOLS[(date.day + 10) % 10];
  }
  
  //****************** triads ********************
  
  // calculate number of days from start of year to the start of a triad in that year
  function daysBeforeTriad(triad) {
    // validate the triad number
    if (triad < 0 || triad > 12)
      throw new UCCException('daysBeforeTriad:Triad Number out of range!');
    // no days before Triad 0
    if (triad == 0) return 0;
    var days = (triad - 1) * 30;
    if (triad < 4) return days + 2;
    else if (triad < 7) return days + 3;
    else if (triad < 10) return days + 4;
    return days + 5;
  }
  
  // return the name of the triad
  function triadName(date) {
    return (date.triad ? TRIADS[date.triad - 1] : 'Zero');
  }
  
  // return the symbol for the triad
  function triadSymbol(date) {
    return (date.triad ? TSYMBOLS[date.triad - 1] : '0');
  }
  
  //****************** days ********************
  
  // days to milliseconds
  function daysToMs(days) {
    return days * ONE_DAY;
  }
  
  // calculate a year number from a number of days since UCC Epoc
  // !!!! Not Tested !!!!
  function daysToYear(days) {
    return Math.floor(days / TROPICAL_YEAR);
  }
  
  // calculate the day-of-the-year from days since UCC Epoc
  // !!!! Not Tested !!!!
  function daysToDoy(days) {
    return days - yearToDays(daysToYear(days)) + 1;
  }
  
  //****************** day-of-the-year ********************
  
  // calculate day-of-the-triad from day-of-the-year
  function doyToDay(doy) {
    // validate the day-of-the-year
    if (doy < 0 || doy > 365)
      throw new UCCException('doyToDay:Day-of-year Number out of range!');
    return doy - daysBeforeTriad(doyToTriad(doy));
  }
  
  // calculate Triad No from Day-of-the-year No
  function doyToTriad(doy) {
    // validate the day-of-the-year
    if (doy < 0 || doy > 365)
      throw new UCCException('doyToTriad:Day-of-year Number out of range!');
    if (doy < 2) return 0;
    else if (doy < 33) return 1;
    else if (doy < 63) return 2;
    else if (doy < 93) return 3;
    else if (doy < 124) return 4;
    else if (doy < 154) return 5;
    else if (doy < 184) return 6;
    else if (doy < 215) return 7;
    else if (doy < 245) return 8;
    else if (doy < 275) return 9;
    else if (doy < 306) return 10;
    else if (doy < 336) return 11;
    return 12;
  }
  
  //****************** years ********************
  
  // return number of days between UCC Epoc and the beginning of a UCC year
  function yearToDays(year) {
    return Math.floor(year * TROPICAL_YEAR);
  }
  
  //******************************** Leap Years *********************
  
  // return number of leap days between UCC Epoc and  the beginning of UCC year
  function leapDays(year) {
    return Math.floor((year / 33) * 8);
  }
  
  function isLeapYear(year) {
    // year is divisible by 33 or remainder < 29 and remainder divisible by 4
    var remainder = year % 33;
    return (remainder == 0 || ((remainder < 29) && remainder % 4 == 0))}
  
  //****************** convert milliseconds to ... ********************
  
  // convert ms since UCC Epoc to days since UCC Epoc
  function msToDays(ms) {
    // 1 day = (24 * 60 *60 * 1000) ms
    return Math.floor(ms / ONE_DAY);
  }
   
  // convert ms since UCC Epoc to UCC year number
  function msToYear(ms) {
    // reciprocal of 33/8 = 0.242424242
    return Math.floor(msToDays(ms) / TROPICAL_YEAR);
  }
  
  // convert ms since UCC Epoc to Day-of-the-year
  function msToDoy(ms) {
    var days = msToDays(ms);
    var year = Math.floor(days / TROPICAL_YEAR);
    var doy = days - yearToDays(year);
    // Leap Year can produce doy = 366
    return (isLeapYear(year) ? doy - 1 : doy);
  }
  
  // extract the Triad number from a ms offset from UCC Epoc
  function msToTriad(ms) {
    var doy = msToDoy(ms);
    return doyToTriad(doy);
  }
  
  // extract the Triad number from a ms offset from UCC Epoc
  function msToDay(ms) {
    var doy = msToDoy(ms);
    return doyToDay(doy);
  }
  
  //******************************** Unix to UCC and UCC to Unix *********************
  
  function UnixToUCC(ms) {
    // subtract a year
    // then offset to UCC Epoc
    return ms - OFFSET - ONE_YEAR;
  }
  
  function UCCtoUnix(ms) {
    // offset to Unix Epoc and add a year
    return ms + OFFSET + ONE_YEAR;
  }
  
  function gregorian(date) {
    // Gregorian dates have no year 0 so we have to convert from our Astronomical format
    var d = new Date(UCCtoUnix(date.instant));
    var time = ('00' + d.getUTCHours()).slice(-2)
      + ':' + ('00' + d.getUTCMinutes()).slice(-2)
      + ':' + ('00' + d.getUTCSeconds()).slice(-2)
      + '.' + ('000' + d.getUTCMilliseconds()).slice(-3);
    if (d.getFullYear() < 1)
      return d.getDate() + '/' + (d.getMonth() + 1) + '/' + (Math.abs(d.getFullYear()) + 1) + ' ' + time + ' BCE';
    return  d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + time + ' CE';
  }
  
  function astronomical(date) {
    // Astronomical dates include a year 0, so Greg 1BC = Astro year 0
    return new Date(date.instant + OFFSET);
  }
  
  //******************************** Parse UCC Date String *********************
  
  // parse a string (either ISO 8601 or UCC year 1st format) to UCC Date
  function parse(str) {
    if (!(typeof(str) === 'string'))
      throw new UCCException('parse expects a string to parse!');
    // first check for an ISO 8601 datestring, which has a 'T' marking the time element
    if (str.indexOf('T') != -1) {
      return UnixToUCC((new Date(str)).valueOf());
    } else {
      // replace non-digits with spaces and pad right to supply missing arguments
      str = str.replace(/\D/g," ") + ' 0 0 0 0 0 0 0 0';
      var dt = str.split(" ");
      // assume UCC datestring, year 1st, use UCCDate() long constructor to calculate the instant
      return (new UCCDate(dt[0], dt[1], dt[2], dt[3], dt[4], dt[5], dt[6])).instant;  
    }
  }
  
  //******************************** Output formats *********************
  
  // output in full format
  function outFull(date) {
    var numbers = ['ONE', 'TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE'];
    if (date.doy == 0) return "0 ZERO " + date.year;
    if (date.doy == 1) return "1st ZERO " + date.year;
    var ord = (date.day > 0 ? UCCDate.ordinal(date.day) : '0');
    return ord + ' ' + numbers[date.triad -1] + '-' + TRIADS[date.triad -1] + TSYMBOLS[date.triad -1] + ' ' + date.year;
  }
  
  // output in medium format
  function outMedium(date) {
    if (intercalSymbol(date)) return intercalSymbol(date) + date.year;
    return date.day + TSYMBOLS[date.triad -1] + date.year;
  }
  
  // output in long format
  function outLong(date) {
    if (date.doy == 0) return "0 ZERO " + date.year;
    if (date.doy == 1) return "1st ZERO " + date.year;
    var ord = (date.day > 0 ? UCCDate.ordinal(date.day) : '0');
    return ord + ' ' + TRIADS[date.triad -1] + TSYMBOLS[date.triad -1] + ' ' + date.year;
  }
  
  // output in short format
  function outShort(date) {
    if (intercalSymbol(date)) return intercalSymbol(date) + String(date.year).slice(-2);
    return date.day + TSYMBOLS[date.triad -1] + String(date.year).slice(-2);
  }
  
  //****************************  Object Definition **************************//
  
  // create UCC object
  var __instant; // the actual instant in time represented by the object, as ms offset from UCC Epoc
  
  //**************************** Scope Safe ****************************//
  // make the constructor scope-safe so scripters can use 'date = new UCCDate()' or just 'date = UCCDate()'
  if (!(this instanceof UCCDate)) {
    return new UCCDate(arguments);
  }
  
  //**************************** Initialise ****************************//
  // see what arguments were specified
  if (arguments.length == 0) {
    // create the object with instant = Now(), relative to UCC Epoc
    __instant = UnixToUCC(new Date().valueOf());
  } else if (arguments.length == 1) {
    var date = arguments[0];
    // could be  UCCDate() or js Date() or numeric ms offset from Unix Epoc
    if (date instanceof UCCDate)
      // simply copy the source object's date
      __instant = date.instant;
    else if (date instanceof Date) {
      // Date() objects are converted by offsetting the valueOf() to UCC Epoc
      __instant = UnixToUCC(date.valueOf());
    }
    else if (typeof(date) === 'string')
      // strings must be parsed
      __instant = parse(date);
    else
      // numbers are assumed to be ms relative to Unix Epoc
      __instant = UnixToUCC(date);
  } else {
    // more arguments mirror Date()'s long constructor but for UCC format 'year, triad, day, hour, minute, second, ms'
    // calculate the number of days before the given year
    var days = yearToDays(Number(arguments[0]));
    // add days before the given triad
    days += daysBeforeTriad(Number(arguments[1]));
    // add ms for days, if day number is given
    if (arguments.length > 2)
      days += Number(arguments[2]);
    // need an extra day in UCC leap years
    if (isLeapYear(Number(arguments[0])))
      days++;
    var ms = daysToMs(days);
    // add ms for hours, if hours is given
    if (arguments.length > 3)
      ms += Number(arguments[3]) * (60 * 60 * 1000);
    // add ms for minutes, if minutes is given
    if (arguments.length > 4)
      ms += Number(arguments[4]) * (60 * 1000);
    // add ms for seconds, if seconds is given
    if (arguments.length > 5)
      ms += Number(arguments[5]) * 1000;
    // add ms if given
    if (arguments.length > 6)
      ms += Number(arguments[6]);
    __instant = ms;
  }
  
  //**************************** Object Properties ***********************//
  
  // object's instant in time relative to UCC Epoc
  Object.defineProperty(this, 'instant', {get: function () {return __instant}});
  
  // offset in milliseconds between UCC Epoc and Unix Epoc
  Object.defineProperty(this, 'offset', {get: function () {return OFFSET}});
  
  // UCC Year
  Object.defineProperty(this, 'year', {get: function () {return msToYear(this.instant)}});

  // days since UCC Epoc
  Object.defineProperty(this, 'days', {get: function () {return msToDays(this.instant)}});

  // day of the Triad
  Object.defineProperty(this, 'day', {get: function () {return msToDay(this.instant)}});

  // day of the year
  Object.defineProperty(this, 'doy', {get: function () {return msToDoy(this.instant)}});

  // current Triad
  Object.defineProperty(this, 'triad', {get: function () {return msToTriad(this.instant)}});

  // days before current Triad
  Object.defineProperty(this, 'triadDays', {get: function () {return daysBeforeTriad(this.triad)}});

  // current Triad name
  Object.defineProperty(this, 'triadName', {get: function () {return triadName(this)}});

  // current Triad symbol
  Object.defineProperty(this, 'triadSymbol', {get: function () {return triadSymbol(this)}});

  // current Quarter
  Object.defineProperty(this, 'quarter', {
    get: function () {return (this.triad > 0 ? Math.floor(this.triad / 4) + 1 : 0)}
  });

  // output date in sortable format
  Object.defineProperty(this, 'sortable', {get: function () {return this.year + '.' +
      ('00' + this.triad).slice(-2) + '.' + ('00' + this.day).slice(-2)}});

  // output date in default format
  Object.defineProperty(this, 'date', {get: function () {return this.day + '.' + this.triad + '.' + this.year}});
  
  // output date in full format
  Object.defineProperty(this, 'full', {get: function () {return outFull(this)}});
  
  // output date in long format
  Object.defineProperty(this, 'long', {get: function () {return outLong(this)}});
  
  // output date in medium format
  Object.defineProperty(this, 'medium', {get: function () {return outMedium(this)}});
  
  // output date in short format
  Object.defineProperty(this, 'short', {get: function () {return outShort(this)}});
  
  // ISO 8601 Date represented by this instant
  Object.defineProperty(this, 'jDate', {get: function () {return new Date(UCCtoUnix(this.instant))}});

  // Gregorian Date represented by this instant
  Object.defineProperty(this, 'gDate', {get: function () {return gregorian(this)}});

  // Leap Days added between Epoc and this instant
  Object.defineProperty(this, 'leapDays', {get: function () {return leapDays(this.year)}});

  // Leap Year?
  Object.defineProperty(this, 'leapYear', {get: function () {return isLeapYear(this.year)}});

  // Leap Year Cycle number
  Object.defineProperty(this, 'leapCycle', {get: function () {return Math.round((this.year - 12) / 33)}});

  // Years since beginning of current Leap Year Cycle
  Object.defineProperty(this, 'leapOffset', {get: function () {return Math.round((this.year - 12) % 33)}});

  // Deek-Day name
  Object.defineProperty(this, 'deekDay', {get: function () {return deekDay(this)}});

  // Greek Deek-Day name
  Object.defineProperty(this, 'greekDay', {get: function () {return greekDay(this)}});

  // Hindi Deek-Day name
  Object.defineProperty(this, 'hindDay', {get: function () {return hindDay(this)}});

  // Deek-Day symbol
  Object.defineProperty(this, 'deekSymbol', {get: function () {return deekSymbol(this)}});

  // Decan number
  Object.defineProperty(this, 'deekNumber', {get: function () {return deekNumber(this)}});

  // Festival
  Object.defineProperty(this, 'festival', {get: function () {return festival(this)}});

  // Festival Number
  Object.defineProperty(this, 'festivalNumber', {get: function () {return festivalNumber(this)}});

  // Festival symbol
  Object.defineProperty(this, 'festivalSymbol', {get: function () {return festivalSymbol(this)}});

  // Intercalary Day
  Object.defineProperty(this, 'intercal', {get: function () {return intercal(this)}});

  // Intercalary Days before current day
  Object.defineProperty(this, 'intercals', {get: function () {return intercals(this)}});

  // Intercalary Day Symbol
  Object.defineProperty(this, 'intercalSymbol', {get: function () {return intercalSymbol(this)}});

  // Moon phase
  Object.defineProperty(this, 'moon', {get: function () {return moonPhase(this)}});

  // Moon phase symbol
  Object.defineProperty(this, 'moonSymbol', {get: function () {return moonSymbol(this)}});

  // Yuga/Age
  Object.defineProperty(this, 'yuga', {get: function () {return yuga(this)}});

  // Zodiac Age
  Object.defineProperty(this, 'zodiac', {get: function () {return zodiac(this)}});

  // Library version
  Object.defineProperty(this, 'version', {get: function () {return VERSION}});
  
  //**************************** Expose our symbol tables ************************//
  Object.defineProperty(this, 'TRIADS', {get: function () {return TRIADS}});
  Object.defineProperty(this, 'TSYMBOLS', {get: function () {return TSYMBOLS}});
  Object.defineProperty(this, 'DECANS', {get: function () {return DECANS}});
  Object.defineProperty(this, 'GREECANS', {get: function () {return GREECANS}});
  Object.defineProperty(this, 'HICANS', {get: function () {return HICANS}});
  Object.defineProperty(this, 'DSYMBOLS', {get: function () {return DSYMBOLS}});
  Object.defineProperty(this, 'MOONS', {get: function () {return MOONS}});
  Object.defineProperty(this, 'MSYMBOLS', {get: function () {return MSYMBOLS}});
}

//****************************** Override built-in methods ************************//

UCCDate.prototype.toString = function () { return this.date; }
UCCDate.prototype.valueOf = function () { return this.instant; }
UCCDate.prototype.value = function () { return this.instant; }

//****************************** Static Methods ***********************************//

UCCDate.ordinal = function (num) {
  if (num > 10 && num < 21 ) return String(num) + 'th'; // 11th, 12th, 13th etc
  if (num % 10 == 1) return String(num) + 'st'; // 1st, 21st, 31st etc
  if (num % 10 == 2) return String(num) + 'nd';
  if (num % 10 == 3) return String(num) + 'rd';
  return String(num) + 'th';
}

//****************************** Exception class ***********************************//

// define an exception
function UCCException(message) {
   this.message = message || 'UCCException';
   this.name = "UCCException";
   this.stack = (new Error()).stack;
}
UCCException.prototype = Object.create(Error.prototype);
UCCException.prototype.constructor = UCCException;

//****************************** END OF UCCDate ***********************************//
//Property	Value	Description
//obj.date	8.10.13521	The date in UCC default format
//obj.sortable	13521.10.08	Date in computer sortable format
//obj.full	8th TEN-Capricorn♑ 13521	Date in full format
//obj.long	8th Capricorn♑ 13521	Date in long format
//obj.medium	8♑13521	Date in medium format
//obj.short	8♑21	Date in short format
var myDate = new UCCDate();
console.log(myDate.short);
