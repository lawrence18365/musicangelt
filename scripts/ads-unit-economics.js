#!/usr/bin/env node

const defaults = {
    spend: 91.55,
    leads: 2,
    packageValue: 2450,
    margin: 0.5,
    leadToBookingRates: [0.5, 0.2, 0.1, 0.05],
};

function parseArgs() {
    const args = { ...defaults };
    for (const raw of process.argv.slice(2)) {
        const [key, value] = raw.replace(/^--/, '').split('=');
        if (!key || value == null) continue;
        if (key === 'spend') args.spend = Number(value);
        if (key === 'leads') args.leads = Number(value);
        if (key === 'package' || key === 'packageValue') args.packageValue = Number(value);
        if (key === 'margin') args.margin = Number(value);
        if (key === 'rates') {
            args.leadToBookingRates = value.split(',').map(v => Number(v.trim())).filter(Number.isFinite);
        }
    }
    return args;
}

function euro(value) {
    return `EUR ${value.toFixed(2)}`;
}

function main() {
    const args = parseArgs();
    if (!args.spend || !args.leads || !args.packageValue || !args.margin) {
        throw new Error('Usage: node scripts/ads-unit-economics.js --spend=91.55 --leads=2 --package=2450 --margin=0.5');
    }

    const cpl = args.spend / args.leads;
    const grossProfit = args.packageValue * args.margin;
    const breakEvenCloseRate = cpl / grossProfit;

    console.log(`# Paid Ads Unit Economics\n`);
    console.log(`| Metric | Value |`);
    console.log(`|---|---:|`);
    console.log(`| Spend | ${euro(args.spend)} |`);
    console.log(`| Paid leads | ${args.leads} |`);
    console.log(`| Cost per lead | ${euro(cpl)} |`);
    console.log(`| Package value | ${euro(args.packageValue)} |`);
    console.log(`| Assumed gross margin | ${(args.margin * 100).toFixed(0)}% |`);
    console.log(`| Gross profit per booking | ${euro(grossProfit)} |`);
    console.log(`| Break-even lead-to-booking rate | ${(breakEvenCloseRate * 100).toFixed(1)}% |`);
    console.log(`\n## Booking Scenarios\n`);
    console.log(`| Lead-to-booking rate | Leads per booking | Est. ad cost per booking | Revenue ROAS | Gross-profit ROAS |`);
    console.log(`|---:|---:|---:|---:|---:|`);

    for (const rate of args.leadToBookingRates) {
        const leadsPerBooking = 1 / rate;
        const costPerBooking = cpl * leadsPerBooking;
        const revenueRoas = args.packageValue / costPerBooking;
        const profitRoas = grossProfit / costPerBooking;
        console.log(`| ${(rate * 100).toFixed(1)}% | ${leadsPerBooking.toFixed(1)} | ${euro(costPerBooking)} | ${revenueRoas.toFixed(1)}x | ${profitRoas.toFixed(1)}x |`);
    }
}

main();
