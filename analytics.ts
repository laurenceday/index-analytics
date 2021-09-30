
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
        return data[data.length - 1] / data[data.length - last_n] - 1;
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

function get_timeslice( last_n : number
                      , data : Array<number>
                      )
{
    if (last_n == 0) {
        return data;
    } else
    {
        return data.slice(data.length - last_n, data.length);
    }
}

function get_tracking_error( etf_queried : Array<number>
                           , etf_benchmark : Array<number>
                           )
{
    let etf_diff: Array<number> = [];
    
    // Can iterate over length of one: assumption that they're same length
    for (let i = 0; i < etf_queried.length; i++) {
        etf_diff[i] = (etf_queried[i] - etf_benchmark[i]);
    }

    return ss.standardDeviation(etf_diff);
}

function information_ratio( lookback_period : number
                          , etf_queried     : Array<number>
                          , etf_benchmark   : Array<number>
                          )
{
    
    // Filter down the dataset to appropriate period
    etf_queried = get_timeslice(lookback_period, etf_queried);
    etf_benchmark = get_timeslice(lookback_period, etf_benchmark);

    let tracking_error = get_tracking_error(etf_queried, etf_benchmark);
    
    let port_returns = get_pct_change(0, etf_queried);
    let bench_returns = get_pct_change(0, etf_benchmark);
    
    return (port_returns - bench_returns) / tracking_error;
  
}

function sharpe_ratio( rfr : number
                     , lookback_period : number,
                     , etf_queried : Array<number>
                     , etf_benchmark : Array<number>
                     )
{
    // Filter down the dataset to appropriate period
    etf_queried = get_timeslice(lookback_period, etf_queried);
    etf_benchmark = get_timeslice(lookback_period, etf_benchmark);
    
    let stdev_returns = 0 // TODO: stdev of portfolio returns, not just P - B
    
    // need to finish this
    return 0;
}

// TODO: Sortino Ratio
// TODO: Standard Deviation of Single Array

const prices1 = [1.4, 1.69, 1.52, 1.58, 1.59];
const prices2 = [1.3, 1.54, 1.29, 1.98, 1.67];
const test_rfr = 0.042
const lookback = 4

function test_stats() {
    
    console.log(`Comparing %s to %s...\n`, prices1, prices2);
    console.log(`Beta: %d`, beta(prices1, prices2));
    console.log(`Alpha: %d`, alpha(test_rfr, lookback, prices1, prices2));
    console.log(`R2: %d`, r2(prices1, prices2));
    console.log(`IR: %d`, information_ratio(lookback, prices1, prices2));

}

test_stats();