queue()
    .defer(d3.json, '/data')
    .await(makeGraphs);
    
function makeGraphs(error, salariesData){
    
    var ndx = crossfilter(salariesData);  

    salariesData.forEach(function(d) {
        d.salary = parseFloat(d.salary);
        if (isNaN(d.salary)) {
            d.salary = 0;
        }
    });
    
    salariesData.forEach(function(d) {
        d.yrs_service = parseFloat(d.yrs_service);
        if (isNaN(d.yrs_service)) {
            d.salary = 0;
    }});
    
//---------------------------no.gender barchart-----------------------------------------

    var gender_dim = ndx.dimension(dc.pluck('sex'));
    var count_by_gender = gender_dim.group();
    
    dc.barChart("#chart1")
        .height(300)
        .width(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(gender_dim)
        .group(count_by_gender)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        // .yAxisLabel("no. in academia")
        .yAxis().ticks(10);
      
//------------------------------avg salary barchart----------------------------------------

    function add_item(p, v) {
        p.count++;
        p.total += v.salary;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if(p.count == 0) {
            p.total = 0;
            p.average = 0;
        }else {
            p.total -= v.salary;
            p.average = p.total / p.count;
        }
        return p;
    }
    
    function init() {
        return {count:0, total:0, average:0};
    }
    
    var av_salary = gender_dim.group().reduce(add_item, remove_item, init);
        
        
    dc.barChart("#chart2")
        .height(300)
        .width(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(gender_dim)
        .group(av_salary)
        .valueAccessor(function(d){
            return d.value.average;
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        .yAxis().ticks(10);
        

//---------------------------avg yrs service barchart-----------------------------------------   
        
    function add_item_2(p, v) {
        p.count++;
        p.total += v.yrs_service;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item_2(p, v) {
        p.count--;
        if(p.count == 0) {
            p.total = 0;
            p.average = 0;
        }else {
            p.total -= v.yrs_service;
            p.average = p.total / p.count;
        }
        return p;
    }
        
    var gender_dim = ndx.dimension(dc.pluck('sex'));
    var av_yrs_service = gender_dim.group().reduce(add_item_2, remove_item_2, init);
    
    dc.barChart("#chart3")
        .height(300)
        .width(400)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(gender_dim)
        .group(av_yrs_service)
        .valueAccessor(function(d){
            return d.value.average;
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        .yAxis().ticks(10);
        
//------------------------------salary yrs of service scatter--------------------------------------

var genderColors = d3.scale.ordinal()
    .domain(["Female", "Male"])
    .range(["pink", "blue"]);

var experienceDim = ndx.dimension(function(d){
    return [d.yrs_service, d.salary, d.rank, d.sex];
    });
var experienceSalaryGroup = experienceDim.group();

var eDim = ndx.dimension(dc.pluck("yrs_service"));
var minExperience = eDim.bottom(1)[0].yrs_service;
var maxExperience = eDim.top(1)[0].yrs_service;

dc.scatterPlot("#service-salary-scatter")
    .width(800)
    .height(400)
    .x(d3.scale.linear().domain([minExperience,maxExperience]))
    .brushOn(false)
    .symbolSize(8)
    .clipPadding(10)
    .yAxisLabel("Salary")
    .xAxisLabel("Years Of Service")
    .title(function (d) {
    return d.value + " " + d.key[3] + " " + d.key[2] + " earned " + d.key[1];
    })
    .colorAccessor(function (d) {
    return d.key[3];
    })
    .colors(genderColors)
    .dimension(experienceDim)
    .group(experienceSalaryGroup)
    .margins({top: 10, right: 50, bottom: 75, left: 75});

//------------------------------salary yrs since phd scatter--------------------------------------

    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);
    
    var phdDim = ndx.dimension(function(d){
        return [d.yrs_since_phd, d.salary, d.rank, d.sex];
    });
    var phdSalaryGroup = phdDim.group();
    
    var eDim2 = ndx.dimension(dc.pluck("yrs_since_phd"));
    var minExperience2 = eDim.bottom(1)[0].yrs_since_phd;
    var maxExperience2 = eDim.top(1)[0].yrs_since_phd;
    
    
    dc.scatterPlot("#phd-salary-scatter")
        .width(800)
        .height(400)
        .x(d3.scale.linear().domain([minExperience,maxExperience]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Salary")
        .xAxisLabel("Years since phd")
        .title(function (d) {
            return d.value + " " + d.key[3] + " " + d.key[2] + " earned " + d.key[1];
        })
        .colorAccessor(function (d) {
            return d.key[3];
        })
        .colors(genderColors)
        .dimension(phdDim)
        .group(phdSalaryGroup)
        .margins({top: 10, right: 50, bottom: 75, left: 75});


    dc.renderAll()
}
