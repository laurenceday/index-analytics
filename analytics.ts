
var ss = require('simple-statistics');

import { excess_returns
       , timeslice
       , tracking_error
       , overall_pct_change
       , pct_returns
       , portfolio_diff
       , stdev } from './auxiliary';

function beta( etf_queried   : Array<number>
             , etf_benchmark : Array<number>
             )
{
    // Verify equal length [or do this in a precheck]
    let joint_cov = ss.sampleCovariance(etf_queried, etf_benchmark);
    let bench_var = ss.sampleVariance(etf_benchmark);
    
    return joint_cov / bench_var;
}


function alpha( rfr             : number
              , lookback_period : number
              , etf_queried     : Array<number>
              , etf_benchmark   : Array<number>
              )
{   
    let return_pct_queried   = overall_pct_change(lookback_period, etf_queried);
    let return_pct_benchmark = overall_pct_change(lookback_period, etf_benchmark);

    let pair_beta = beta(etf_queried, etf_benchmark);
    
    return return_pct_queried - rfr - pair_beta * (return_pct_benchmark - rfr);
}

function r2( etf_queried   : Array<number>
           , etf_benchmark : Array<number>
           )
{
    return ss.sampleCorrelation( etf_queried, etf_benchmark ) ** 2;
}


function information_ratio( lookback_period : number
                          , etf_queried     : Array<number>
                          , etf_benchmark   : Array<number>
                          )
{
    
    // Filter down the dataset to appropriate period
    etf_queried = timeslice(lookback_period, etf_queried);
    etf_benchmark = timeslice(lookback_period, etf_benchmark);

    let te = tracking_error(etf_queried, etf_benchmark);
    
    let port_returns = overall_pct_change(0, etf_queried);
    let bench_returns = overall_pct_change(0, etf_benchmark);
    
    return (port_returns - bench_returns) / te;
  
}

function sharpe_ratio( rfr : number
                     , lookback_period : number
                     , etf_queried : Array<number>
                     )
{
    // Filter down the dataset to appropriate period
    etf_queried = timeslice(lookback_period, etf_queried);
    
    let port_returns = overall_pct_change(0, etf_queried);
    
    let stdev_excess_returns = stdev(excess_returns(rfr, etf_queried));

    // The RFR - as an annual figure - should be scaled into the time we're actually looking at
    // i.e. an annual RFR of 4% considered over 10 days is actually (0.04 / 360) * 10 = 0.11%
    let scaled_rfr = (rfr / 360) * etf_queried.length
    
    return (port_returns - scaled_rfr) / stdev_excess_returns;
}

function stdev_returns( lookback_period : number,
                        etf_queried: Array<number>
                      )
{
    etf_queried = timeslice(lookback_period, etf_queried);
    
    let etf_returns = pct_returns(etf_queried);
    
    return stdev(etf_returns);
}

// TODO: Sortino Ratio
// TODO: Standard Deviation of Single Array

const prices1 = [1.4, 1.69, 1.52, 1.58, 1.59];
const prices2 = [1.3, 1.54, 1.29, 1.98, 1.67];
const test_rfr = 0.042069
const lookback = 0 // zero lookback = consider the whole thing. non-zero = take N most recent days

function test_stats() {
    
    console.log(`Comparing E1 %s to E2 %s...`, prices1, prices2);
    console.log(`Test risk-free rate: %d%\n`, test_rfr * 100) 
    
    console.log(`Beta: %d`, beta(prices1, prices2));
    console.log(`Alpha: %d`, alpha(test_rfr, lookback, prices1, prices2));
    console.log(`R2: %d`, r2(prices1, prices2));
    console.log(`IR: %d`, information_ratio(lookback, prices1, prices2));
    
    console.log('')
    
    console.log(`Sharpe Ratio of E1: %d`, sharpe_ratio(test_rfr, lookback, prices1));
    console.log(`Sharpe Ratio of E2: %d`, sharpe_ratio(test_rfr, lookback, prices2));
    
    console.log('')
    
    console.log(`Stdev Returns of E1: %d`, stdev_returns(lookback, prices1));
    console.log(`Stdev Returns of E2: %d`, stdev_returns(lookback, prices2));

}

test_stats();