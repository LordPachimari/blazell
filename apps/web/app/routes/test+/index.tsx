// import React from "react";
// import {
// 	DataSheetGrid,
// 	checkboxColumn,
// 	textColumn,
// 	keyColumn,
// } from "react-datasheet-grid";

// // Import the style only once in your app!
// import "react-datasheet-grid/dist/style.css";
const Test = () => {
	// const [data, setData] = React.useState([
	// 	{ firstName: "Elon", lastName: "Musk" },
	// 	{ firstName: "Jeff", lastName: "Bezos" },
	// ]);

	// const columns = [
	// 	{
	// 		...keyColumn("firstName", textColumn),
	// 		title: "First name",
	// 	},
	// 	{
	// 		...keyColumn("lastName", textColumn),
	// 		title: "Last name",
	// 	},
	// ];
	return (
		<div className="w-screen h-screen  justify-center items-center">
			<h1>Test</h1>
			{/* <div className="m-20">
				<DataSheetGrid
					value={data}
					onChange={setData}
					columns={columns}
					className="table-selector"
					addRowsComponent={false}
					gutterColumn={false}
				/>
			</div> */}
		</div>
	);
};
export default Test;
