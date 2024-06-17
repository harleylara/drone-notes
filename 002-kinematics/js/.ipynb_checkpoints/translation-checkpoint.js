<div id="b5" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('b5', {boundingbox:[-5,10,10,-5], axis:true, showNavigation:true, showCopyright:false});
    
    var a = board.create('slider',[[-4,-1],[4,-1],[-4,6,8]],{name:'x'});
    var b = board.create('slider',[[-4,-2],[4,-2],[-4,7,8]],{name:'y'});
    var radius = 2;
    var p1 = board.create('point', [
    function() {return a.Value();},
    function() {return b.Value();}]);
    
    var p2 = board.create('point', [
    function() {return p1.X()}, 
    function() {return p1.Y() + radius}], {visible:false});
    var circle1 = board.create('circle', [p1, p2]);
    var va = board.create('line',[[0,0],p1],{straightFirst:false, straightLast:false, lastArrow:true});
    
    var x = board.create('line',[[
    function(){return p1.X();},0],p1],{straightFirst:false, straightLast:false, strokeWidth:2, dash:2});
    var y = board.create('line',[[0,
    function(){return p1.Y();}],p1],{straightFirst:false, straightLast:false, strokeWidth:2, dash:2});
</script>