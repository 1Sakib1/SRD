const fs = require('fs');
let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = `            <HeatMap locations={mapLocations} center={mapCenter} height="550px" onMapClick={handleMapClick} selectedLocation={selectedLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};`;

const replacement = `            <HeatMap locations={mapLocations} center={mapCenter} height="550px" onMapClick={handleMapClick} selectedLocation={selectedLocation} />
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>
            <strong>Research Disclaimer:</strong> This application is for demonstration and research purposes only. 
            The map data, machine learning classifications, and eco-points are experimental and may not reflect real-world action by municipal authorities.
          </p>
        </div>
      </div>
    </div>
  );
};`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Added disclaimer to bottom of ReportRubbish');
} else {
    console.error('Target not found!');
}
