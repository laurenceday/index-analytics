
var ss = require('simple-statistics');

export function timeslice( last_n : number
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

export function overall_pct_change( last_n : number
                                  , data   : Array<number>
                                  )
{
    if (last_n == 0) {
        return data[data.length - 1] / data[0] - 1;
    }
    else {
        return data[data.length - 1] / data[data.length - last_n] - 1;
    }
}

export function pct_returns( data : Array<number>
                           )
{
    let returns: Array<number> = [];
    
    for (let i = 0; i < data.length - 1; i++) {
        returns[i] = (data[i + 1] / data[i]) - 1;
    }
    
    return returns;
}

export function stdev( data : Array<number>
              )
{
    return ss.standardDeviation(data);
}

export function portfolio_diff( etf_queried : Array<number>
                              , etf_benchmark : Array<number>
                              )
{
    let etf_diff: Array<number> = [];
    
    // Can iterate over length of one: assumption that they're same length
    for (let i = 0; i < etf_queried.length; i++) {
        etf_diff[i] = (etf_queried[i] - etf_benchmark[i]);
    }
    
    return etf_diff;
}

export function tracking_error( etf_queried : Array<number>
                              , etf_benchmark : Array<number>
                              )
{
    return stdev(portfolio_diff(etf_queried, etf_benchmark));
}

// Assumes that all data is daily, so we divide rfr by 360 for daily result
export function excess_returns( rfr : number
                              , etf_queried : Array<number>
                              )
{
    rfr = rfr / 360;
    
    let etf_returns = pct_returns(etf_queried);
    
    for (let i = 0; i < etf_returns.length; i++) {
        etf_returns[i] = etf_returns[i] - rfr;
    }
    
    return etf_returns;
}
