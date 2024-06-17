<div id="b3" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('b3', {boundingbox:[-2,10,5,-2], axis:true, showNavigation:true, showCopyright:false});
    
    var p1 = board.create('point',[2,5]);
    var l1 = board.create('line',[[0,0],p1],{straightFirst:false, straightLast:false, lastArrow:true});
    l1.setAttribute({fixed:true});
    var text = board.create('text',[0.2, 0, 
    function(){
        return l1.L().toFixed(2);
    }], {anchor: l1});
    
    var x = board.create('line',[[
    function(){return p1.X();},0],p1],{straightFirst:false, straightLast:false, strokeWidth:2, dash:2});
    var y = board.create('line',[[0,
    function(){return p1.Y();}],p1],{straightFirst:false, straightLast:false, strokeWidth:2, dash:2});

</script>