<div id="b9" class="jxgbox" style="width:500px; height:500px;"></div>
<script type="text/javascript">

    var board = JXG.JSXGraph.initBoard('b9', {boundingbox:[-6,12,12,-6], axis:true, showNavigation:true, showCopyright:false});
    
    var length = 2;
    
    var t1 = board.create('slider',[[6,-1],[9,-1],[-4,0,8]],{name:'a_{13}'});
    var t2 = board.create('slider',[[6,-2],[9,-2],[-4,0,8]],{name:'a_{23}'});
    var t3 = board.create('slider',[[6,-3],[9,-3],[-4,1,8]],{name:'a_{33}'});
    
    var a = board.create('slider',[[-5,-1],[-2,-1],[-3,1,2]],{name:'a_{11}'});
    var b = board.create('slider',[[0.5,-1],[3.5,-1],[-3,0,2]],{name:'a_{12}'});
    
    var c = board.create('slider',[[-5,-2],[-2,-2],[-3,0,2]],{name:'a_{21}'});
    var d = board.create('slider',[[0.5,-2],[3.5,-2],[-3,1,2]],{name:'a_{22}'});
    
    var e = board.create('slider',[[-5,-3],[-2,-3],[-3,0,2]],{name:'a_{31}'});
    var f = board.create('slider',[[0.5,-3],[3.5,-3],[-3,0,2]],{name:'a_{32}'});
    
    var sq = [],
        right = board.create('transform', [
        function() {return length;}, 0], {type: 'translate'}),
        up = board.create('transform', [0, 
        function() {return length;}], {type: 'translate'}),
        pol, p0;
        
    var afTr = board.create('transform', [
    function(){return t3.Value();}, function() {return e.Value();}, function() {return f.Value();},
    function(){return t1.Value();}, function() {return a.Value();}, function() {return b.Value();},
    function(){return t2.Value();}, function() {return c.Value();}, function() {return d.Value();}], {type: 'generic'});

    sq[0] = board.create('point', [0,0], {visible: false}),
    sq[1] = board.create('point', [sq[0], right], {visible: false}),
    sq[2] = board.create('point', [sq[0], [right, up]], {visible: false}),
    sq[3] = board.create('point', [sq[0], up], {visible: false}),

    pol = board.create('polygon', sq, {visible: false});
    pol2 = board.create('polygon', [pol, afTr]);
</script>