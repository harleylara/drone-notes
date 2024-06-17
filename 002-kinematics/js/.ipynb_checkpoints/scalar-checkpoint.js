<div id="jxgbox" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox:[-5,10,5,-5], axis:true, showNavigation:true, showCopyright:false});
    
    var a = board.create('slider',[[-4,-2],[4,-2],[-4,1.5,4]],{name:'a'});
    var p1 = board.create('point',[2,5]);
    var l1 = board.create('line',[[0,0],p1],{straightFirst:false, straightLast:false, lastArrow:true});
    l1.setAttribute({fixed:true});
    var p2 = board.create('point',[
    function() {return a.Value()*p1.X();},
    function() {return a.Value()*p1.Y();}]);
    var l2 = board.create('line',[p1,p2],{straightFirst:false, straightLast:false, lastArrow:true});
</script>