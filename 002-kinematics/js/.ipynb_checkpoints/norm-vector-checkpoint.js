<div id="b4" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('b4', {boundingbox:[-2,5,5,-2], axis:true, showNavigation:true, showCopyright:false});
    
    var p1 = board.create('point',[2,3]);
    var l1 = board.create('line',[[0,0],p1],{straightFirst:false, straightLast:false, lastArrow:true});
    l1.setAttribute({fixed:true});
    function norm(point) {
      return Math.sqrt(p1.X()**2 + p1.Y()**2)
    }
    var p2 = board.create('point',[
    function() {return p1.X()/norm(p1);},
    function() {return p1.Y()/norm(p1);}]);
    var normal = board.create('line',[[0,0],p2],{straightFirst:false, straightLast:false, lastArrow:true, strokeColor:'#ff0000'});
</script>