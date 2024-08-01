import React from "react";
import type { FavList } from "client-core";

interface FavoritesModalProps {
	show: boolean;
	onHide: () => void;
	favorites: FavList;
}

const FavoritesModal = ({ show, onHide, favorites }: FavoritesModalProps) => {
	const favList = Object.keys(favorites).map((id) => favorites[id]);

	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded shadow-md w-full max-w-md">
				<div className="px-4 py-2 border-b">
					<h5 className="text-lg font-semibold">Favorites</h5>
				</div>
				<div className="p-4">
					{favList.length === 0 ? (
						<p>No favorites yet</p>
					) : (
						<ul>
							{favList.map(
								(fav) =>
									fav && (
										<li key={fav.name} className="py-1">
											{fav.name}
										</li>
									),
							)}
						</ul>
					)}
				</div>
				<div className="px-4 py-2 border-t text-right">
					<button type="button"
						onClick={onHide}
						className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default FavoritesModal;
