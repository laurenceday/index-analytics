
var ss = require('simple-statistics');

function beta( etf_queried   : Array<number>
             , etf_benchmark : Array<number>
             )
{
    // Verify equal length [or do this in a precheck]
    let joint_cov = ss.sampleCovariance(etf_queried, etf_benchmark);
    let bench_var = ss.sampleVariance(etf_benchmark);
    
    return joint_cov / bench_var;
}

function get_pct_change(last_n: number, data: Array<number>) {
    if (last_n == 0) {
        return data[data.length - 1] / data[0] - 1;
    }
    else {
        return data[data.length - 1] / data[data.length - (1 + last_n)] - 1;
    }
}

function alpha( rfr             : number
              , lookback_period : number
              , etf_queried     : Array<number>
              , etf_benchmark   : Array<number>
              )
{   
    let return_pct_queried   = get_pct_change(lookback_period, etf_queried);
    let return_pct_benchmark = get_pct_change(lookback_period, etf_benchmark);

    let pair_beta = beta(etf_queried, etf_benchmark);
    
    return return_pct_queried - rfr - pair_beta * (return_pct_benchmark - rfr);
}

function r2( etf_queried   : Array<number>
           , etf_benchmark : Array<number>
           )
{
    return ss.sampleCorrelation( etf_queried, etf_benchmark ) ** 2;
}

const prices1 = [1.4, 1.69, 1.52, 1.58, 1.59];
const prices2 = [1.3, 1.54, 1.29, 1.98, 1.67];

function test_stats() {
    
    console.log(`Comparing %s to %s...`, prices1, prices2);
    console.log(`Beta: %d`, beta(prices1, prices2));
    console.log(`Alpha: %d`, alpha(0.0403, 0, prices1, prices2));
    console.log(`R2: %d`, r2(prices1, prices2));

}

test_stats();