export function Statistics() {
    return (
        <div className="panel">
            <div className="scan"></div>

            <div className="panel-header">COLLECTION OVERVIEW</div>

            <div className="panel-row total">
                <span>Total Games</span>
                <span className="value">6</span>
            </div>

            <div className="panel-row"><span>PS1</span><span className="value">12</span></div>
            <div className="panel-row"><span>PS2</span><span className="value">56</span></div>
            <div className="panel-row"><span>PS3</span><span className="value">45</span></div>
            <div className="panel-row"><span>PS4</span><span className="value">22</span></div>
            <div className="panel-row"><span>PS5</span><span className="value">19</span></div>
        </div>
    );
}