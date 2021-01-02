#include<stdio.h>
#include<string.h>

char *triads[]={"0","Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"};
char *tsymbols[]={"0","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"};
char *dsymbols[]={"☉","☿","♀","⊕","♂","⚳","♃","♄","♅","♆"};
char *months[]={" ","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE"};
char dyear[6];

int get_date()
{
    FILE *p;
    char ch;

  p = popen("node UCCdate.js","r");
    if( p == NULL)
    {
        puts("Unable to open process");
        return(1);
    }
    char date[11];
    fscanf(p, "%s", date);
    strncpy(dyear, date, 5);
    dyear[5] = 0;
    pclose(p);

    return(0);
}

//int checkday(const char *str) {
//    if (dyear[0] == '1' && dyear[1] == '0') {
//        int dday = 10;
//    }
//    return (dday);
//}

void calendar(int year, int daycode)
{
        int month, day;
        int dday=13;
        month=10;
        {
                printf("        %s-%s%s", months[month],triads[month],tsymbols[month]);
                /*printf("\n pr se te qu qu se se oi no de\n");*/
                printf("\n ☉  ☿  ♀  ⊕  ♂  ⚳  ♃  ♄  ♅  ♆\n");

                // Print all the dates for one month
                for (day = 1; day <= 30; day++)
                {
                        if ( day == dday)
                                printf("\033[30;107m%2d\033[39;49m", dday);
                        else
                                printf("%2d", day);

                        // Is day before ♆? Else start next line ☉.
                        if ((day + daycode) % 10 > 0)
                                printf(" ");
                        else
                                printf("\n");
                }
        }
}

int main(int argc, char *argv[])
{	
	get_date();	
	int year, daycode, leapyear;
        daycode=0;
	calendar(year, daycode);
	printf("\n");
}
