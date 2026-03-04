const TrackRow = ({ item, highlight, onClick }) => {
    const feedback = item.user_feedback;

    const isRated = !!feedback;
    const isLiked = feedback === "LIKE";
    const isDisliked = feedback === "DISLIKE";
    const isNotMyStyle = feedback === "NOT_MY_STYLE";

    return (
        <div
            onClick={() => {
                if (!isRated && onClick) onClick();
            }}
            className={`
                group
                bg-white rounded-xl p-4 flex items-center gap-4
                border border-gray-100 shadow-sm
                transition-all duration-200
                ${highlight ? "ring-1 ring-indigo-200 bg-indigo-50/40" : ""}
                ${
                isRated
                    ? "opacity-60 cursor-default"
                    : "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
            }
            `}
        >
            {/* Cover */}
            <img
                src={item.album_image || item.image_url}
                alt={item.track_name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shadow"
            />

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                    {item.track_name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    {item.artists?.map((a) => a.name).join(", ")}
                </p>
            </div>

            {/* STATUS BADGE */}
            {isRated && (
                <div className="text-sm font-medium">
                    {isLiked && (
                        <span className="text-green-600">
                            ✓ Rated
                        </span>
                    )}

                    {isDisliked && (
                        <span className="text-red-500">
                            👎 Not my type
                        </span>
                    )}

                    {isNotMyStyle && (
                        <span className="text-amber-500">
                            😐 Not my type
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrackRow;
