#include <iostream>
#include <chrono>
#include <cmath>

#define VERSION "1.0.6"
#define OFFSET -425128348800000     // offset of UCC Epoc from Unix Epoc in milliseconds
#define ONE_DAY 86400000            // 24 * 60 * 60 * 1000 ms
#define ONE_YEAR 31536000000        // 365 * 24 * 60 * 60 * 1000 ms
#define TROPICAL_YEAR 365.242424242 // tropical year in days
#define ONE_AD 4200940 * ONE_DAY    // 1 Jan 0001 is 4200940 days since UCC Epoc
#define MOON_PERIOD 29.530588853    // period for calculating moon phase
#define i int64_t

const char *TRIADS[] = {"Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"};
const char *TSYMBOLS[] = {"\u2648","\u2649","\u264A","\u264B","\u264C","\u264D","\u264E","\u264F","\u2650","\u2651","\u2652","\u2653"};
const char *DECANS[] = {"Neptune","Sol","Mercury","Venus","Earth","Mars","Ceres","Jupiter","Saturn","Uranus"};
const char *HICANS[] = {"Varuna","Surya","Budha","Shukra","Thal","Mangala","Shakti","Guru","Shani","Vasuki"};
const char *GREECANS[] = {"Poseidon","Helios","Hermes","Aphrodite","Terra","Ares","Demeter","Zeus","Cronus","Caelus"};
const char *DSYMBOLS[] = {"\u2646","\u2609","\u263F","\u2640","\u2295","\u2642","\u26B3","\u2643","\u2644","\u2645"};
const char *MOONS[] = {"New","Waxing crescent","1st quarter","Waxing gibbous","Full","Waning gibbous","3rd quarter","Waning crescent"};
// const char *MSYMBOLS[] = {"\uD83C\uDF11","\uD83C\uDF12","\uD83C\uDF13","\uD83C\uDF14","\uD83C\uDF15","\uD83C\uDF16","\uD83C\uDF17","\uD83c\uDF18"};
const char *MSYMBOLS[] = {"🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘" };

using namespace std;

string ordinal(i num){
    if (num > 10 && num < 21 ) return to_string(num) + "th"; // 11th, 12th, 13th etc
    if (num % 10 == 1) return to_string(num) + "st"; // 1st, 21st, 31st etc
    if (num % 10 == 2) return to_string(num) + "nd";
    if (num % 10 == 3) return to_string(num) + "rd";
    return to_string(num) + "th";
}

i daysBeforeTriad(i triad) {
    // validate the triad number
    if (triad < 0 || triad > 12)
        exit(1);
    // throw new UCCException('daysBeforeTriad:Triad Number out of range!');
    // no days before Triad 0
    if (triad == 0) return 0;
    i days = (triad - 1) * 30;
    if (triad < 4) return days + 2;
    else if (triad < 7) return days + 3;
    else if (triad < 10) return days + 4;
    return days + 5;
}

bool isLeapYear(i year) {
    // year is divisible by 33 or remainder < 29 and remainder divisible by 4
    i remainder = year % 33;
    return (remainder == 0 || ((remainder < 29) && remainder % 4 == 0));
}

// convert ms since UCC Epoc to days since UCC Epoc
i msToDays(i ms) {
    // 1 day = (24 * 60 *60 * 1000) ms
    return floor(ms / ONE_DAY);
}

// convert ms since UCC Epoc to UCC year number
i msToYear(i ms) {
    // reciprocal of 33/8 = 0.242424242
    return floor(msToDays(ms) / TROPICAL_YEAR);
}

i yearToDays(i year) {
    return floor(year * TROPICAL_YEAR);
}

// convert ms since UCC Epoc to Day-of-the-year
i msToDoy(i ms) {
    i days = msToDays(ms);
    i year = floor(days / TROPICAL_YEAR);
    i doy = days - yearToDays(year);
    // Leap Year can produce doy = 366
    return (isLeapYear(year) ? doy - 1 : doy);
}

// calculate Triad No from Day-of-the-year No
i doyToTriad(i doy) {
    // validate the day-of-the-year
    if (doy < 0 || doy > 365)
        exit(2);
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

// extract the Triad number from a ms offset from UCC Epoc
i msToTriad(i ms) {
    i doy = msToDoy(ms);
    return doyToTriad(doy);
}
// calculate day-of-the-triad from day-of-the-year
i doyToDay(i doy) {
    // validate the day-of-the-year
    if (doy < 0 || doy > 365)
        exit(3);
    return doy - daysBeforeTriad(doyToTriad(doy));
}

// extract the Triad number from a ms offset from UCC Epoc
i msToDay(i ms) {
    i doy = msToDoy(ms);
    return doyToDay(doy);
}

i daysToMs(i days) {
    return days * ONE_DAY;
}

class UCCDate {
    private:
        i instant;

        i unixToUCC(i unixTimestamp) {
            return unixTimestamp - OFFSET - ONE_YEAR;
        }

        i UCCtoUnix(i uccTimestamp) {
            return uccTimestamp + OFFSET + ONE_YEAR;
        }

        i parse(string s) {
            // // first check for an ISO 8601 datestring, which has a 'T' marking the time element
            // if (str.indexOf('T') != -1) {
            //     return UnixToUCC((new Date(str)).valueOf());
            // } else {
            //     // replace non-digits with spaces and pad right to supply missing arguments
            //     str = str.replace(/\D/g," ") + ' 0 0 0 0 0 0 0 0';
            //     var dt = str.split(" ");
            //     // assume UCC datestring, year 1st, use UCCDate() long constructor to calculate the instant
            //     return (new UCCDate(dt[0], dt[1], dt[2], dt[3], dt[4], dt[5], dt[6])).instant;  
            // }
        }

    public:

        UCCDate() {
            instant = unixToUCC(chrono::duration_cast<chrono::milliseconds>(chrono::system_clock::now().time_since_epoch()).count());
        }

        UCCDate(i numeric_ms_offset_from_epoch){
            instant = numeric_ms_offset_from_epoch;
        }

        UCCDate(UCCDate* date){
            instant = date->instant;
        }

        UCCDate(string date){
            instant = parse(date);
        }

        UCCDate(i year, i triad, i day, i hour, i minute, i second, i ms){
            i days = yearToDays(year);
            days += daysBeforeTriad(triad);
            days += day;
            if (isLeapYear(year))
                days++;
            long timestamp = daysToMs(days);
            timestamp += hour * (60 * 60 * 1000);
            timestamp += minute * (60 * 1000);
            timestamp += second * 1000;
            timestamp += ms;
        }

        long getInstant(){
            return instant;
        }

        string outFull(){
            string numbers[] = {"ONE", "TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE"};
            if (doy() == 0) return "0 ZERO " + to_string(year());
            if (doy() == 1) return "1st ZERO " + to_string(year());
            string ord = day() > 0 ? ordinal(day()) : "0";
            return ord + ' ' + numbers[triad() -1] + '-' + TRIADS[triad() -1] + TSYMBOLS[triad() -1] + ' ' + to_string(year());
        }

        i day(){ return msToDay(instant); }

        i year(){ return msToYear(instant); }

        i doy(){ return msToDoy(instant); }

        i triad(){ return msToTriad(instant); }

        i triadDays(){ return daysBeforeTriad(triad()); }

        string triadName() { return (triad() ? TRIADS[triad() - 1] : "Zero"); }

        string triadSymbol() { return (triad() ? TSYMBOLS[triad() - 1] : "0"); }
};

int main(int argc, char **argv){
    auto d = UCCDate();
    cout << d.outFull() << endl;
}
